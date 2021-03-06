/* eslint-disable import/no-named-as-default */
/* eslint-disable no-console */
import supertest from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../../api/app';
import config from '../../../config';
import * as mdb from '../../../lib/mongoDB';
import { generateToken } from '../../../lib/jwtHelpers';
import hashPassword from '../../../lib/bcryptHelpers';
import log from '../../../lib/logger';

// This is coming from @shelf/jest-mongodb
const connectionString = global.__MONGO_URI__;
const database = 'test';

jest.mock('../../../lib/bcryptHelpers');

describe('Auth routes', () => {
  describe('Login', () => {
    let appInit;
    beforeEach(async () => {
      await mdb.init(connectionString, database);
      appInit = app();

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password', salt);

      await mdb.insertItem({
        collectionName: 'users',
        item: {
          email: 'test1@test.com',
          password: hash
        }
      });
    });

    afterEach(async () => {
      await mdb.dropDB({ collectionName: 'users' });
      await mdb.createCollection({ collectionName: 'users' });
    });

    afterAll(async () => {
      jest.restoreMock('../../../lib/bcryptHelpers');
      await mdb.closeMongoConnection();
    });

    it('should succesfully login a user', async () => {
      const res = await supertest(appInit)
        .post('/auth/login')
        .send({
          email: 'test1@test.com',
          password: 'password'
        });

      const { statusCode, header, body } = res;

      expect(statusCode).toBe(200);
      expect(body.token).toBeDefined();
      expect(body.auth).toBe(true);
      expect(body.user.email).toBe('test1@test.com');
      expect(body.user.id).toBeDefined();
      expect(header['set-cookie'][0][0]).toBeDefined();
      expect(header['set-cookie'][0][1]).toBeDefined();
    });

    it('should return an error message if either email or password missing', async () => {
      const res = await supertest(appInit)
        .post('/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(res.body).toEqual({
        errors: { missing_fields: 'Please include an email and password' }
      });
    });

    it('should reject if user not found', async () => {
      const res = await supertest(appInit)
        .post('/auth/login')
        .send({
          email: 'noUser@test.com',
          password: 'password'
        });

      expect(res.body).toEqual({ errors: { email: 'User not found' } });
    });

    it('should reject if password incorrect', async () => {
      const res = await supertest(appInit)
        .post('/auth/login')
        .send({
          email: 'test1@test.com',
          password: 'wrong_password'
        });

      expect(res.body).toEqual({
        errors: { password: 'Wrong password amigo!' }
      });
    });
  });

  describe('Register', () => {
    let newUser;
    let appInit;

    beforeEach(async () => {
      await mdb.init(connectionString, database);
      appInit = app();

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('password', salt);

      await mdb.insertItem({
        collectionName: 'users',
        item: {
          email: 'test1@test.com',
          password: hash
        }
      });

      newUser = {
        firstName: 'Test',
        lastName: 'McTesterson',
        email: 'testXYZ@test.com',
        password: 'password',
        password2: 'password'
      };
    });

    afterEach(async () => {
      await mdb.dropDB({ collectionName: 'users' });
      await mdb.createCollection({ collectionName: 'users' });
    });

    afterAll(async () => {
      jest.restoreMock('../../../lib/bcryptHelpers');
      await mdb.closeMongoConnection();
    });

    it('should register a user', async () => {
      hashPassword.mockReturnValue('password');

      const res = await supertest(appInit)
        .post('/auth/register')
        .send(newUser);

      expect(res.body).toEqual({ message: 'Success' });
    });

    it('should return an error if fields are missing', async () => {
      Object.keys(newUser).forEach(async (key) => {
        const obj = newUser;
        obj[key] = '';

        const res = await supertest(appInit)
          .post('/auth/register')
          .send(obj);

        expect(res.body).toEqual({
          errors: { missing_fields: 'Some fields are missing' }
        });
      });
    });

    it('should return an error if the passwords dont match', async () => {
      const objs = [
        { ...newUser, password: 'wrong_password' },
        { ...newUser, password2: 'wrong_password' }
      ];

      objs.forEach(async (obj) => {
        const res = await supertest(appInit)
          .post('/auth/register')
          .send(obj);

        expect(res.body).toEqual({
          errors: { password: 'Passwords dont match' }
        });
      });
    });

    it('should return an error if the user already exists', async () => {
      newUser.email = 'test1@test.com';
      const res = await supertest(appInit)
        .post('/auth/register')
        .send(newUser);

      expect(res.body).toEqual({
        errors: { email: 'Email already exists' }
      });
    });

    it('should return an error if bcrypt hashing fails', async () => {
      newUser.email = 'newEmail@test.com';
      hashPassword.mockReturnValue(null);

      const res = await supertest(appInit)
        .post('/auth/register')
        .send(newUser);

      expect(res.body).toEqual({
        errors: { bcrypt: 'Something went wrong while hashing the password' }
      });
    });

    it('should return an error if saving the user fails', async () => {
      const { insertItem } = mdb;
      mdb.insertItem = jest.fn().mockReturnValueOnce(false);
      hashPassword.mockReturnValue(true);

      const res = await supertest(appInit)
        .post('/auth/register')
        .send(newUser);

      // Not ideal but have to use this method since mockReset and mockRestore only reset the mocked function, NOT to its original state
      mdb.insertItem = insertItem;

      expect(res.body).toEqual({
        errors: {
          save_user_error: 'Something went wrong while saving the user'
        }
      });
    });
  });

  describe('verifyUser', () => {
    let appInit;

    beforeEach(async () => {
      await mdb.init(connectionString, database);
      appInit = app();
    });

    it('should return isAuthenticated=true if valid', async () => {
      const token = await jwt.sign({ message: 'Test' }, config.SECRET);
      const [header, payload, signature] = token.split('.');

      const res = await supertest(appInit)
        .get('/auth/verifyUser')
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({ isAuthenticated: true });
    });

    it('should return Error if if JWT cookie is invalid', async () => {
      // eslint-disable-next-line no-unused-vars
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .get('/auth/verifyUser')
        .set('Cookie', `COOKIE_1=${header}.;COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        errors: {
          isAuthenticated: false,
          message: 'Token malformed'
        }
      });
    });

    it('should return Error if no cookies', async () => {
      const res = await supertest(appInit).get('/auth/verifyUser');

      expect(res.body).toEqual({
        errors: {
          isAuthenticated: false,
          message: 'Missing the cookie property in the headers'
        }
      });
    });
  });

  describe('logout', () => {
    let appInit;

    beforeEach(async () => {
      await mdb.init(connectionString, database);
      appInit = app();
    });

    it('should successfully logout and reset the cookies ', async () => {
      const token = await jwt.sign({ message: 'Test' }, config.SECRET);
      const [header, payload, signature] = token.split('.');

      const res = await supertest(appInit)
        .get('/auth/logout')
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({ loggedOut: true, isAuthenticated: false });
      expect(res.headers['set-cookie'][0]).toEqual(
        expect.stringContaining('COOKIE_1=;'),
        expect.stringContaining('COOKIE_2=;')
      );
    });
  });

  describe('currentUser', () => {
    let hash;
    let appInit;
    beforeEach(async () => {
      try {
        await mdb.init(connectionString, database);
        appInit = app();

        const salt = await bcrypt.genSalt(10);
        hash = await bcrypt.hash('password', salt);

        await mdb.insertItem({
          collectionName: 'users',
          item: {
            _id: '123',
            email: 'test1@test.com',
            password: hash
          }
        });
      } catch (e) {
        log.err(e);
      }
    });

    afterEach(async () => {
      try {
        await mdb.dropDB({ collectionName: 'users' });
        await mdb.createCollection({ collectionName: 'users' });
      } catch (e) {
        log.err(e);
      }
    });

    it('should successfully return the current user', async () => {
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .get('/auth/currentUser')
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        user: {
          id: '123',
          email: 'test1@test.com'
        }
      });
    });
  });

  describe('changePassword', () => {
    let hash;
    let appInit;
    beforeEach(async () => {
      try {
        await mdb.init(connectionString, database);
        appInit = app();

        const salt = await bcrypt.genSalt(10);
        hash = await bcrypt.hash('password', salt);

        await mdb.insertItem({
          collectionName: 'users',
          item: {
            email: 'test1@test.com',
            password: hash
          }
        });
      } catch (e) {
        log.err(e);
      }
    });

    afterEach(async () => {
      try {
        await mdb.dropDB({ collectionName: 'users' });
        await mdb.createCollection({ collectionName: 'users' });
      } catch (e) {
        log.err(e);
      }
    });

    it('should successfully change the users password', async () => {
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .post('/auth/changePassword')
        .send({
          email: 'test1@test.com',
          password: 'password',
          newPassword: 'password2',
          newPasswordConfirm: 'password2'
        })
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({ message: 'Success' });
    });

    it('should fail if passwords dont match', async () => {
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .post('/auth/changePassword')
        .send({
          email: 'testxxx@test.com',
          password: 'password',
          newPassword: 'password11111',
          newPasswordConfirm: 'password2222222'
        })
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        errors: { password: 'Passwords dont match' }
      });
    });

    it('should fail if it cant find a user', async () => {
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .post('/auth/changePassword')
        .send({
          email: 'testxxx@test.com',
          password: 'password',
          newPassword: 'password2',
          newPasswordConfirm: 'password2'
        })
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        errors: { email: 'Couldnt find a user with that email' }
      });
    });

    it('should fail if the current password is incorrect', async () => {
      const [header, payload, signature] = await generateToken();

      const res = await supertest(appInit)
        .post('/auth/changePassword')
        .send({
          email: 'test1@test.com',
          password: 'incorrect_password',
          newPassword: 'password',
          newPasswordConfirm: 'password'
        })
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        errors: { password: 'You must enter your current password' }
      });
    });

    it('should fail if it cant hash the password', async () => {
      const [header, payload, signature] = await generateToken();

      hashPassword.mockReturnValue(null);

      const res = await supertest(appInit)
        .post('/auth/changePassword')
        .send({
          email: 'test1@test.com',
          password: 'password',
          newPassword: 'password2',
          newPasswordConfirm: 'password2'
        })
        .set('Cookie', `COOKIE_1=${header}.${payload};COOKIE_2=${signature}`);

      expect(res.body).toEqual({
        errors: {
          hashing_error: 'Something went wrong while hashing the password'
        }
      });
    });
  });
});
