import supertest from 'supertest';
import app from '../../../api/app';

describe('Login', () => {
  test('It should succesfully display the root page', async () => {
    const appInit = app();
    const { statusCode, body } = await supertest(appInit).get('/');

    expect(statusCode).toBe(200);
    expect(body).toEqual({
      routes: [
        { method: 'POST', router: 'http://localhost:4000/auth/login' },
        { method: 'POST', router: 'http://localhost:4000/auth/register' },
        { method: 'GET', router: 'http://localhost:4000/auth/verifyUser' },
        { method: 'GET', router: 'http://localhost:4000/auth/logout' },
        { method: 'GET', router: 'http://localhost:4000/auth/currentUser' },
        { method: 'POST', router: 'http://localhost:4000/auth/changePassword' }
      ]
    });
  });
});
