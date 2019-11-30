import bcrypt from 'bcryptjs';

export const hashPassword = (pw, salt) => bcrypt.hash(pw, salt);

export default hashPassword;
