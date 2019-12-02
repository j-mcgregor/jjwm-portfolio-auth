import supertest from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../../api/app';
import config from '../../../config';
import mdb from '../../../lib/mongoDB';
import { insertItem } from '../../../lib/mongoDB';
import hashPassword from '../../../lib/bcryptHelpers';

const connectionString = global.__MONGO_URI__; // This is coming from @shelf/jest-mongodb
const database = 'test';

jest.mock('../../../lib/bcryptHelpers');

describe('Auth routes', () => {
  describe('Login', () => {
    beforeEach(async () => {
      await mdb.init(connectionString, database);

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
      const res = await supertest(app)
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
      expect(header['set-cookie']).toHaveLength(2);
      expect(header['set-cookie'][0]).toBeDefined();
      expect(header['set-cookie'][1]).toBeDefined();
    });

    it('should return an error message if either email or password missing', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(res.body).toEqual({
        errors: { missingFields: 'Please include an email and password' }
      });
      expect(res.statusCode).toBe(422);
    });

    it('should reject if user not found', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'noUser@test.com',
          password: 'password'
        });

      expect(res.body).toEqual({ errors: { email: 'User not found' } });
      expect(res.statusCode).toBe(400);
    });

    it('should reject if password incorrect', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'test1@test.com',
          password: 'wrong_password'
        });

      expect(res.body).toEqual({
        errors: { password: 'Wrong password amigo!' }
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('Register', () => {
    let newUser;

    beforeEach(async () => {
      await mdb.init(connectionString, database);

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

      const res = await supertest(app)
        .post('/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ message: 'Success' });
    });

    it('should return an error if fields are missing', async () => {
      Object.keys(newUser).forEach(async key => {
        const obj = newUser;
        obj[key] = '';

        const res = await supertest(app)
          .post('/auth/register')
          .send(obj);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          errors: { missingFields: 'Some fields are missing' }
        });
      });
    });

    it('should return an error if the passwords dont match', async () => {
      const objs = [
        { ...newUser, password: 'wrong_password' },
        { ...newUser, password2: 'wrong_password' }
      ];

      objs.forEach(async obj => {
        const res = await supertest(app)
          .post('/auth/register')
          .send(obj);

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({
          errors: { password: "Passwords don't match" }
        });
      });
    });

    it('should return an error if the user already exists', async () => {
      newUser.email = 'test1@test.com';
      const res = await supertest(app)
        .post('/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        errors: { email: 'Email already exists' }
      });
    });

    it('should return an error if bcrypt hashing fails', async () => {
      newUser.email = 'newEmail@test.com';
      hashPassword.mockReturnValue(null);

      const res = await supertest(app)
        .post('/auth/register')
        .send(newUser);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        errors: { bcrypt: 'Something went wrong while hashing the password' }
      });
    });

    it('should return an error if saving the user fails', async () => {
      // Have to import * as mdb to make this test work
      // Only want to test 1 exported function
      mdb.insertItem = jest.fn().mockReturnValue(false);
      hashPassword.mockReturnValue(true);

      const res = await supertest(app)
        .post('/auth/register')
        .send(newUser);

      console.log(res);
      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        errors: { saveUserError: 'Something went wrong while saving the user' }
      });
    });
  });

  describe('verifyUser', () => {
    it('should return isAuthenticated=true if valid', async () => {
      const token = await jwt.sign({ message: 'Test' }, config.secret);
      const [header, payload, signature] = token.split('.');

      const res = await supertest(app)
        .get('/auth/verifyUser')
        .set('Cookie', [
          `COOKIE_1=${header}.${payload}`,
          `COOKIE_2=${signature}`
        ]);

      expect(res.body).toEqual({ isAuthenticated: true });
      expect(res.statusCode).toBe(200);
    });

    it('should return Error if cookie is invalid', async () => {
      const token = await jwt.sign({ message: 'Test' }, config.secret);
      const [header, _, signature] = token.split('.');

      const res = await supertest(app)
        .get('/auth/verifyUser')
        .set('Cookie', [`COOKIE_1=${header}.broken`, `COOKIE_2=${signature}`]);

      expect(res.body).toEqual({ error: 'Token malformed' });
      expect(res.statusCode).toBe(400);
    });

    it('should return Error if no cookies', async () => {
      const res = await supertest(app).get('/auth/verifyUser');

      expect(res.body).toEqual({ error: 'Missing cookies' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('logout', () => {
    it('should successfully logout and reset the cookies ', async () => {
      const token = await jwt.sign({ message: 'Test' }, config.secret);
      const [header, payload, signature] = token.split('.');

      const res = await supertest(app)
        .get('/auth/logout')
        .set('Cookie', [
          `COOKIE_1=${header}.${payload}`,
          `COOKIE_2=${signature}`
        ]);

      expect(res.body).toEqual({ loggedOut: true, isAuthenticated: false });
      expect(res.statusCode).toBe(200);
      expect(res.headers['set-cookie'][0]).toEqual(
        expect.stringContaining('COOKIE_1=;')
      );
      expect(res.headers['set-cookie'][1]).toEqual(
        expect.stringContaining('COOKIE_2=;')
      );
    });
  });

  describe('currentUser', () => {
    beforeEach(async () => {
      await mdb.init(connectionString, database);

      await insertItem({
        collectionName: 'users',
        item: {
          _id: '123',
          email: 'test1@test.com',
          password: 'password'
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

    it('should successfully return the current user', async () => {
      const token = await jwt.sign({ email: 'test1@test.com' }, config.secret);
      const [header, payload, signature] = token.split('.');

      const res = await supertest(app)
        .get('/auth/currentUser')
        .set('Cookie', [
          `COOKIE_1=${header}.${payload}`,
          `COOKIE_2=${signature}`
        ]);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        user: {
          _id: '123',
          email: 'test1@test.com',
          password: 'password'
        }
      });
    });
  });

  // describe('verifyPassword', () => {
  //   it('should successfully verify the users password', () => {});
  // });
});
