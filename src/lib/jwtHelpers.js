/* eslint-disable import/prefer-default-export */
import jwt from 'jsonwebtoken';
import config from '../config';

export const generateToken = async () => {
  try {
    const token = await jwt.sign({ email: 'test1@test.com' }, config.SECRET);
    return token;
  } catch (error) {
    return error;
  }
};

/**
 *
 * @desc function to check if incoming request has the correct cookie configuration
 * @returns '{ error: { [key]: value }, data: { COOKIE_1: '', COOKIE_2: ''} }'
 */

export const extractJWTFromCookies = ({ cookie }) => {
  try {
    if (!cookie) throw 'Missing the cookie property in the headers';

    const [COOKIE_1, COOKIE_2] = cookie.split(';');
    if (!COOKIE_1 || !COOKIE_2) {
      throw 'Missing cookie';
    }

    const [key1, value1] = COOKIE_1.split('=');
    const [key2, value2] = COOKIE_2.split('=');
    if (!value1) throw 'Missing cookie values';
    if (!value2) throw 'Missing cookie values';

    const data = {};

    data[key1.trim()] = value1;
    data[key2.trim()] = value2;

    return { data };
  } catch (e) {
    return { errors: e };
  }
};
