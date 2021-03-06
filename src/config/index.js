require('dotenv').config();

module.exports = {
  PORT: parseInt(process.env.PORT, 10),
  MONGODB_URI: process.env.MONGODB_URI,
  MONGODB_NAME: process.env.MONGODB_NAME,
  SECRET: process.env.NODE_ENV === 'test' ? 'secret' : process.env.SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  sessionOptions: (pass) => ({
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
    origin:
      process.env.NODE_ENV !== 'production'
        ? 'http://localhost:3000'
        : 'https://jjwm-portfolio-client.herokuapp.com',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    headers:
      'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token'
  }
};
