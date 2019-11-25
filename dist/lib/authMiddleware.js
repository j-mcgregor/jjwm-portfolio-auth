"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _passport = _interopRequireDefault(require("passport"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _assembleToken = _interopRequireDefault(require("./assembleToken"));

var _config = _interopRequireDefault(require("../config"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-prototype-builtins */
var _default = (req, res, next) => {
  const {
    cookies = {}
  } = req;

  if (!cookies.COOKIE_1 || !cookies.COOKIE_2) {
    const errors = {};
    if (!cookies.COOKIE_1) errors.cookie1 = 'COOKIE 1 missing';
    if (!cookies.COOKIE_2) errors.cookie2 = 'COOKIE 2 missing';
    res.status(400).json({
      errors
    });
  } else {
    const token = (0, _assembleToken.default)(cookies);

    _passport.default.authenticate('jwt', () => {
      try {
        const decoded = _jsonwebtoken.default.verify(token, _config.default.secret);

        req.user = decoded;
        next();
      } catch (errors) {
        const err = new Error(errors);
        res.status(400).json({
          err
        });
      }
    })(req, res, next);
  }
};

exports.default = _default;
//# sourceMappingURL=authMiddleware.js.map