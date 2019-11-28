import supertest from 'supertest';
import mongoose from 'mongoose';
import User from '../../../models/User';
import app from '../../../api/app';

// MongoClient.Promise = require('bluebird');

jest.useFakeTimers();

describe('Test the root path', () => {
  let connection;
  let db;
  let user;

  beforeAll(async function blah() {
    mongoose.connect('mongodb://127.0.0.1:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // const users = await DB.collection('users');

    // console.log(users);
    user = {
      email: 'test1@test.com',
      password: 'password'
    };

    User.create(user);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('It should response the GET method', async () => {
    const res = await supertest(app).get('/auth/');
    // console.log(res);
    expect(res.statusCode).toBe(200);
  });

  it('should POST', () => {
    supertest(app)
      .post('/auth/login', user)
      .then(res => {
        debugger;
        expect(res.statusCode).toBe(999);
      });
  });
});
