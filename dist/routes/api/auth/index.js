"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(require("express"));

var _bcryptjs = _interopRequireDefault(require("bcryptjs"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _config = _interopRequireDefault(require("../../../config"));

var _User = _interopRequireDefault(require("../../../models/User"));

var _authMiddleware = _interopRequireDefault(require("../../../lib/authMiddleware"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const router = _express.default.Router(); // @route    POST /auth/register
// @desc     Login in a User
// @access   Public


router.post('/login', async (req, res) => {
  const {
    email,
    password
  } = req.body;
  const errors = {};
  let match;
  const user = await _User.default.findOne({
    email
  });

  if (!user) {
    errors.email = 'User not found';
  } else {
    match = await _bcryptjs.default.compare(password, user.password);
  }

  if (!match) {
    errors.password = 'Wrong password';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      errors
    });
  }

  const body = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };
  const token = await _jsonwebtoken.default.sign(body, _config.default.secret, {
    expiresIn: 3600
  });
  const [header, payload, signature] = token.split('.');
  res.cookie('COOKIE_1', `${header}.${payload}`, {
    expires: new Date(Date.now() + 1800000)
  });
  res.cookie('COOKIE_2', signature, {
    httpOnly: true
  });
  res.json({
    user,
    token,
    auth: true
  });
}); // @route    POST /users/register
// @desc     Register a User
// @access   Public

router.post('/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    password2
  } = req.body;
  const errors = {};
  const user = await _User.default.findOne({
    email
  });

  if (password !== password2) {
    errors.password = "Passwords don't match";
    errors.password2 = "Passwords don't match";
    return res.status(400).json({
      errors
    });
  }

  if (user) {
    errors.email = 'Email already exists';
    return res.status(400).json({
      errors
    });
  }

  const newUser = new _User.default({
    firstName,
    lastName,
    email,
    password
  });
  const salt = await _bcryptjs.default.genSalt(10);

  try {
    const hash = await _bcryptjs.default.hash(newUser.password, salt);
    newUser.password = hash;
  } catch (e) {
    res.json(e);
  }

  try {
    const userSaved = await newUser.save();
    res.json({
      user: userSaved
    });
  } catch (e) {
    res.json(e);
  }
});
router.get('/verifyUser', _authMiddleware.default, (req, res, next) => {
  res.json({
    isAuthenticated: true
  });
});
router.get('/logout', (req, res, next) => {
  res.cookie('COOKIE_1', '');
  res.cookie('COOKIE_2', '');
  res.json({
    loggedOut: true,
    isAuthenticated: false
  });
});
router.get('/currentUser', _authMiddleware.default, async (req, res) => {
  const {
    email
  } = req.user;

  try {
    const user = await _User.default.findOne({
      email
    });
    res.json({
      user
    });
  } catch (error) {
    res.json({
      error
    });
  }
});
router.post('/verifyPassword', _authMiddleware.default, async (req, res) => {
  const {
    email,
    password,
    newPassword,
    newPasswordConfirm
  } = req.body;
  const errors = {};
  const user = await _User.default.findOne({
    email
  });
  const match = await _bcryptjs.default.compare(password, user.password);

  if (!match) {
    errors.wrongPassword = 'You must enter your current password';
  }

  if (newPassword !== newPasswordConfirm) {
    errors.password = "Passwords don't match";
  }

  const salt = await _bcryptjs.default.genSalt(10);

  try {
    const hash = await _bcryptjs.default.hash(newPassword, salt);
    user.password = hash;
    user.save();
  } catch (e) {
    res.json(e);
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      errors
    });
  } else {
    return res.status(201).json({
      message: 'Success'
    });
  }
});
var _default = router;
exports.default = _default;
//# sourceMappingURL=index.js.map