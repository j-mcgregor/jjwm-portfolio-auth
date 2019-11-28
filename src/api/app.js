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
import auth from '../routes/api/auth';

const { sessionSecret, sessionMap, corsOptions } = config;

const env = process.env.NODE_ENV !== 'test';
const log = message => env && console.log(message);

const app = express();
app.use(logger('dev'));

app.use(helmet());
log('Middleware added: helmet');

app.use(cookieParser());
log('Middleware added: cookie-parser');

app.use(cors(corsOptions));
log('Middleware added: cookie');

app.use(session(sessionMap(sessionSecret)));
log('Middleware added: express-session');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
log('Middleware added: body-parser');

app.use(passport.initialize());
log('Middleware added: passport');
passportConfig(passport);

app.use('/auth', auth);

module.exports = app;
// export default app;
