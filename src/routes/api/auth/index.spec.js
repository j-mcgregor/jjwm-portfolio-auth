import supertest from 'supertest';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import app from '../../../api/app';
import User from '../../../models/User';

// describe('Test the root path', () => {
//   test('It should response the GET method', async () => {
//     const res = await supertest(app).get('/auth/');

//     expect(res.statusCode).toBe(200);
//   });

//   test('It should test the POST method', async () => {
//     const res = await supertest(app).post('/auth/test');

//     expect(res.body).toBe({ blah: 'test' });
//   });
// });

describe('Test the login path', () => {
  let connection;
  // let db;

  beforeAll(async () => {
    connection = await mongoose.connect(`${process.env.MONGO_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('Login', () => {
    let user;

    beforeAll(async () => {
      // const users = db.collection('users');
      user = {
        email: 'test1@test.com',
        password: 'password'
      };
      await User.create(user);
    });

    test('It should succesfully login a user', async () => {
      const { statusCode, body } = await supertest(app)
        .post('/auth/login')
        .send({
          email: 'test1@test.com',
          password: 'password'
        });

      expect(statusCode).toBe(200);
      expect(body.token).toBeDefined();
      expect(body.auth).toBe(true);
      expect(body.user.email).toBe('test1@test.com');
      expect(body.user.id).toBeDefined();
    });

    test('It should reject a user with the wrong email', async () => {
      const res = await supertest(app)
        .post('/auth/login')
        .send({
          email: '',
          password: ''
        });

      expect(res.statusCode).toBe(422);
    });
  });
});
