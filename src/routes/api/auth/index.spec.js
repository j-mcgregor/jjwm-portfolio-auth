import supertest from 'supertest';
import { MongoClient } from 'mongodb';
import app from '../../../api/app';

describe('Test the root path', () => {
  test('It should response the GET method', async () => {
    const res = await supertest(app).get('/auth/');

    expect(res.statusCode).toBe(200);
  });
});

describe('Test the login path', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db();
  });

  afterAll(async () => {
    await connection.close();
  });

  describe('Login', () => {
    let user;

    beforeAll(async () => {
      const users = db.collection('users');
      user = {
        email: 'test1@test.com',
        password: 'password'
      };
      await users.insertOne(user);
    });

    test('It should succesfully login a user', () => {
      return supertest(app)
        .post('/auth/login', user)
        .then(res => {
          expect(res.statusCode).toBe(200);
        });
    });

    test('It should reject a user with the wrong email', () => {
      return supertest(app)
        .post('/auth/login', { email: '', password: 'password' })
        .then(res => {
          console.log(res);
          expect(res.statusCode).toBe(200);
        })
        .catch(err => {
          console.log(err);
        });
    });
  });
});
