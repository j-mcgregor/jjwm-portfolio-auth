import { assembleToken } from './assembleToken';

describe('assembleToken', () => {
  it('should create a token from 2 cookies', () => {
    const token = assembleToken({
      COOKIE_1: 'header.payload',
      COOKIE_2: 'signature'
    });
    expect(token).toBe('header.payload.signature');
  });

  it('should throw an error if COOKIE_1 is missing', () => {
    const token = assembleToken({ COOKIE_1: '', COOKIE_2: 'signature' });
    expect(token).toEqual(Error('Invalid cookies object'));
  });

  it('should throw an error if COOKIE_2 is missing', () => {
    const token = assembleToken({ COOKIE_1: 'header.payload', COOKIE_2: '' });
    expect(token).toEqual(Error('Invalid cookies object'));
  });

  it('should throw an error if COOKIE_1 and COOKIE_2 missing', () => {
    const token = assembleToken({ COOKIE_1: '', COOKIE_2: '' });
    expect(token).toEqual(Error('Invalid cookies object'));
  });
});
