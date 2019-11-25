/* eslint-disable no-prototype-builtins */
import passport from 'passport';
import jwt from 'jsonwebtoken';
import assembleToken from './assembleToken';
import config from '../../config';

export default (req, res, next) => {
  const { cookies = {} } = req;

  if (!cookies.COOKIE_1 || !cookies.COOKIE_2) {
    const errors = {};
    if (!cookies.COOKIE_1) errors.cookie1 = 'COOKIE 1 missing';
    if (!cookies.COOKIE_2) errors.cookie2 = 'COOKIE 2 missing';
    res.status(400).json({ errors });
  } else {
    const token = assembleToken(cookies);

    passport.authenticate('jwt', () => {
      try {
        const decoded = jwt.verify(token, config.secret);
        req.user = decoded;
        next();
      } catch (errors) {
        const err = new Error(errors);
        res.status(400).json({ err });
      }
    })(req, res, next);
  }
};
