/* eslint-disable no-prototype-builtins */
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { assembleToken } from './assembleToken';
import config from '../config';
import passportConfig from '../config/passport';

passportConfig(passport);

// TO DO - logger
// TO DO - handleError function

export default (req, res, next) => {
  const { cookies } = req;

  try {
    const present =
      cookies ||
      cookies.hasOwnProperty('COOKIE_1') ||
      cookies.hasOwnProperty('COOKIE_2');

    const cookiesHaveValues = cookies.COOKIE_1 && cookies.COOKIE_2;

    if (!present || !cookiesHaveValues) throw new Error();

    passport.authenticate('jwt', () => {
      try {
        const token = assembleToken(cookies);
        const decoded = jwt.verify(token, config.secret);
        if (!decoded) throw new Error();
        req.user = decoded;
        next();
      } catch (e) {
        return res.status(400).json({ error: 'Token malformed' });
      }
    })(req, res, next);
  } catch (e) {
    return res.status(401).json({ error: 'Missing cookies' });
  }
};
