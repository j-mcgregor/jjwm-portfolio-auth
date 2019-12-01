import bcrypt from 'bcryptjs';
import { hashPassword } from './bcryptHelpers';

describe('hashPassword', () => {
  it('should succesfully hash a password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password', salt);

    const hashedPassword = await hashPassword('password', salt);
    expect(hashedPassword).toBe(hash);
  });
});
