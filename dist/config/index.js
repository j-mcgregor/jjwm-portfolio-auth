"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dotenv = _interopRequireDefault(require("dotenv"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_dotenv.default.config();

var _default = {
  port: parseInt(process.env.PORT, 10),
  db: process.env.MONGODB_URI,
  secret: process.env.SECRET,
  sessionSecret: process.env.SESSION_SECRET,
  sessionMap: pass => ({
    secret: pass,
    cookie: {
      secure: true,
      httpOnly: true
    },
    saveUninitialized: false,
    resave: false
  }),
  corsOptions: {
    origin: '*',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers: 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token'
  }
};
exports.default = _default;
//# sourceMappingURL=index.js.map