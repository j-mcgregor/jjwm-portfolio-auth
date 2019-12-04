import { Strategy, ExtractJwt } from 'passport-jwt';
import config from './index';
import User from '../models/User';
import { getItem } from '../lib/mongoDB';

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.secret
};

export default passport => {
  passport.use(
    new Strategy(opts, async (jwt_payload, done) => {
      try {
        const user = await getItem({
          collectionName: 'users',
          key: 'email',
          value: jwt_payload.email
        });

        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        if (!user.validPassword(jwt_payload.password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(err);
      }
    })
  );
};
