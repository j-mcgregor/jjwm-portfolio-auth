/* eslint-disable no-prototype-builtins */
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { assembleToken } from './assembleToken';
import config from '../config';
import passportConfig from '../config/passport';

passportConfig(passport);

export default (req, res, next) => {
  const { cookies } = req;
  // console.log(req);
  try {
    const present =
      cookies.hasOwnProperty('COOKIE_1') && cookies.hasOwnProperty('COOKIE_2');

    const cookiesHaveValues = cookies.COOKIE_1 && cookies.COOKIE_2;

    if (!present || !cookiesHaveValues) throw 'Missing cookies';

    passport.authenticate('jwt', () => {
      try {
        const token = assembleToken(cookies);
        const decoded = jwt.verify(token, config.secret);
        if (!decoded) throw 'Token malformed';
        req.user = decoded;
        next();
      } catch (error) {
        return res.status(400).json({ error });
      }
    })(req, res, next);
  } catch (error) {
    return res.status(401).json({ error });
  }
};
