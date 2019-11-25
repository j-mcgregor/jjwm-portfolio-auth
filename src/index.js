/* eslint-disable no-console */
import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import config from '../config';
import passportConfig from '../config/passport';
import auth from './routes/api/auth';

const { port, db, sessionSecret, sessionMap, corsOptions } = config;

const app = express();
app.use(logger('dev'));

mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');

    app.use(helmet());
    console.log('Middleware added: helmet');

    app.use(cookieParser());
    console.log('Middleware added: cookie-parser');

    app.use(cors(corsOptions));
    console.log('Middleware added: cookie');

    app.use(session(sessionMap(sessionSecret)));
    console.log('Middleware added: express-session');

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    console.log('Middleware added: body-parser');

    app.use(passport.initialize());
    console.log('Middleware added: passport');
    passportConfig(passport);

    app.use('/auth', auth);

    app.listen({ port }, () =>
      console.log('🚀 Server ready at', `http://localhost:${port}`)
    );
  })
  .catch(err => console.log(err));
