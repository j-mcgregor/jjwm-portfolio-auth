import { Strategy, ExtractJwt } from 'passport-jwt';
import config from './index';
import User from '../src/models/User';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret
};

export default (passport) => {
  passport.use(
    new Strategy(opts, (jwt_payload, done) => {
      User.findOne({ email: jwt_payload.email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(jwt_payload.password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    })
  );
};
