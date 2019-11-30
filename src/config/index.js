require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10),
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_NAME: process.env.MONGODB_NAME,
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
  mongoOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  corsOptions: {
    origin: '*',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers:
      'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token'
  }
};
