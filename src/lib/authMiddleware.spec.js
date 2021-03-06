import * as jwt from 'jsonwebtoken';
import authMiddleware from './authMiddleware';

jest.mock('jsonwebtoken');

const mockRequest = (data) => ({ headers: { ...data } });

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
      cookie: 'COOKIE_1=abc.def;COOKIE_2=ghi'
    });
    const next = jest.fn();

    jwt.verify.mockReturnValue({ id: '1', email: 'success@test.com' });

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({ id: '1', email: 'success@test.com' });
    expect(next).toHaveBeenCalled();
  });

  it('should reject if missing COOKIE_1', () => {
    const res = mockResponse();
    const req = mockRequest({
      cookie: 'COOKIE_2=def;'
    });
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.errors).toEqual({ key: 'cookie', message: 'COOKIE_1 missing' });
  });

  it('should reject if missing COOKIE_2', () => {
    const res = mockResponse();
    const req = mockRequest({
      cookie: 'COOKIE_1=abc.def;'
    });
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.errors).toEqual({ key: 'cookie', message: 'COOKIE_2 missing' });
  });

  it('should reject if the jwt is malformed', () => {
    const res = mockResponse();
    const req = mockRequest({
      cookie: 'COOKIE_1=abc.;COOKIE_2='
    });
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.errors).toEqual({
      key: 'cookie',
      message: 'Missing cookie values'
    });
  });
});

// TODO: extractJWTFromCookies test
