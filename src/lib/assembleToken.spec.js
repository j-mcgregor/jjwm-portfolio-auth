import assembleToken from './assembleToken';

describe('assembleToken', () => {
  it('should create a token from 2 cookies', () => {
    const token = assembleToken('header.payload', 'signature');
    expect(token).toBe('header.payload.signature');
  });

  it('should throw an error if COOKIE_1 is missing', () => {
    const token = assembleToken('', 'signature');
    expect(token).toBe('');
  });

  it('should throw an error if COOKIE_2 is missing', () => {
    const token = assembleToken('header.payload', '');
    expect(token).toBe('');
  });

  it('should throw an error if COOKIE_1 and COOKIE_2 missing', () => {
    const token = assembleToken('', '');
    expect(token).toBe('');
  });
});
