/* eslint-disable no-console */
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import passport from 'passport';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import config from '../config';
import passportConfig from '../config/passport';
import base from '../routes/api/root';
import auth from '../routes/api/auth';
import log from '../lib/logger';

const { sessionSecret, sessionMap, corsOptions } = config;

const defaultOptions = { useLogger: false, useMorgan: false };

const appInit = ({ useLogger, useMorgan } = defaultOptions) => {
  const app = express();

  if (useMorgan) app.use(logger('dev'));

  app.use(helmet());
  log.info('Middleware added: helmet', useLogger);

  app.use(cookieParser());
  log.info('Middleware added: cookie-parser', useLogger);

  app.use(cors(corsOptions));
  log.info('Middleware added: cookie', useLogger);

  app.use(session(sessionMap(sessionSecret)));
  log.info('Middleware added: express-session', useLogger);

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  log.info('Middleware added: body-parser', useLogger);

  app.use(passport.initialize());
  log.info('Middleware added: passport', useLogger);
  passportConfig(passport);

  app.use('/', base);
  app.use('/auth', auth);
  log.info('Routes added', useLogger);

  return app;
};

export default appInit;
