require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10),
  db: process.env.MONGODB_URI,
  MONGO_URI_TEST: process.env.MONGO_URI_TEST,
  MONGO_DB_NAME_TEST: process.env.MONGO_DB_NAME_TEST,
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
    headers:
      'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token'
  }
};
