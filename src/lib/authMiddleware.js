/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable operator-linebreak */
/* eslint-disable no-prototype-builtins */
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy, ExtractJwt } from 'passport-jwt';
import assembleToken from './assembleToken';
import { extractJWTFromCookies } from './jwtHelpers';
import config from '../config';
import sendError from './sendError';

const opts = {
  jwtFromRequest: ExtractJwt.fromHeader(),
  secretOrKey: config.SECRET
};

export default (req, res, next) => {
  const { headers } = req;

  try {
    const jwtCookie = extractJWTFromCookies(headers);
    if (jwtCookie.errors) throw { key: 'cookie', message: jwtCookie.errors };

    const {
      data: { COOKIE_1, COOKIE_2 }
    } = jwtCookie;

    passport.use(
      new Strategy(opts, (jwt_payload, done) => {
        done(jwt_payload);
      })
    );

    passport.authenticate('jwt', () => {
      let token;

      try {
        token = assembleToken(COOKIE_1, COOKIE_2);
        if (!token) throw { key: 'token', message: 'Token malformed' };

        try {
          const decoded = jwt.verify(token, config.SECRET);
          req.user = decoded;
          return next();
        } catch (err) {
          if (err) {
            res.errors = {
              err: err.name,
              message: err.message
            };
            return next();
          }
        }
      } catch (e) {
        res.errors = e;
        return next();
      }
    })(req, res, next);
  } catch (e) {
    res.errors = e;
    return next();
  }
};
