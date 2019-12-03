import { generateToken } from './jwtHelpers';

describe('generateToken', () => {
  it('should return an array', async () => {
    const [a, b, c] = await generateToken();

    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(c).toBeDefined();
  });
});
