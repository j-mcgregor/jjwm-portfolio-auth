"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _passportJwt = require("passport-jwt");

var _index = _interopRequireDefault(require("./index"));

var _User = _interopRequireDefault(require("../src/models/User"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const opts = {
  jwtFromRequest: _passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: _index.default.secret
};

var _default = passport => {
  passport.use(new _passportJwt.Strategy(opts, (jwt_payload, done) => {
    _User.default.findOne({
      email: jwt_payload.email
    }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        return done(null, false, {
          message: 'Incorrect username.'
        });
      }

      if (!user.validPassword(jwt_payload.password)) {
        return done(null, false, {
          message: 'Incorrect password.'
        });
      }

      return done(null, user);
    });
  }));
};

exports.default = _default;
//# sourceMappingURL=passport.js.map