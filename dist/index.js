"use strict";

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _morgan = _interopRequireDefault(require("morgan"));

var _cors = _interopRequireDefault(require("cors"));

var _passport = _interopRequireDefault(require("passport"));

var _helmet = _interopRequireDefault(require("helmet"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cookieParser = _interopRequireDefault(require("cookie-parser"));

var _expressSession = _interopRequireDefault(require("express-session"));

var _config = _interopRequireDefault(require("./config"));

var _passport2 = _interopRequireDefault(require("./config/passport"));

var _auth = _interopRequireDefault(require("./routes/api/auth"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable no-console */
const {
  port,
  db,
  sessionSecret,
  sessionMap,
  corsOptions
} = _config.default;
const app = (0, _express.default)();
app.use((0, _morgan.default)('dev'));

_mongoose.default.connect(db, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
  app.use((0, _helmet.default)());
  console.log('Middleware added: helmet');
  app.use((0, _cookieParser.default)());
  console.log('Middleware added: cookie-parser');
  app.use((0, _cors.default)(corsOptions));
  console.log('Middleware added: cookie');
  app.use((0, _expressSession.default)(sessionMap(sessionSecret)));
  console.log('Middleware added: express-session');
  app.use(_bodyParser.default.urlencoded({
    extended: false
  }));
  app.use(_bodyParser.default.json());
  console.log('Middleware added: body-parser');
  app.use(_passport.default.initialize());
  console.log('Middleware added: passport');
  (0, _passport2.default)(_passport.default);
  app.use('/auth', _auth.default);
  app.listen({
    port
  }, () => console.log('🚀 Server ready at', `http://localhost:${port}`));
}).catch(err => console.log(err));
//# sourceMappingURL=index.js.map