import authMiddleware from './authMiddleware';
import * as jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const mockRequest = data => ({
  ...data,
  headers: {
    authorization: 'auth'
  }
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('authMiddleware', () => {
  afterEach(() => {
    jwt.verify.mockRestore();
  });
  it('should test correctly', async () => {
    const res = mockResponse();
    const req = mockRequest({
      cookies: {
        COOKIE_1: 'abc.def',
        COOKIE_2: 'ghi'
      }
    });
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: '1', email: 'success@test.com' });

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: '1', email: 'success@test.com' });
    expect(next).toHaveBeenCalled();
  });

  it('should reject if no cookies', () => {
    const res = mockResponse();
    const req = mockRequest({
      cookies: {
        COOKIE_1: 'abc.def',
        COOKIE_2: ''
      }
    });
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing cookies' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject if the jwt is malformed', () => {
    const res = mockResponse();
    const req = mockRequest({
      cookies: {
        COOKIE_1: 'abc',
        COOKIE_2: 'ghi'
      }
    });
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token malformed' });
    expect(next).not.toHaveBeenCalled();
  });
});
