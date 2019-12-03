import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = async () => {
  const token = await jwt.sign({ email: 'test1@test.com' }, config.secret);
  return token.split('.');
};
