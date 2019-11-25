import assembleToken from './assembleToken';

describe('assembleToken', () => {
  it('should create a token from 2 cookies', () => {
    const cookies = { COOKIE_1: 'header.payload', COOKIE_2: 'signature' };
    const token = assembleToken(cookies);
    expect(token).toBe('header.payload.signature');
  });
});
