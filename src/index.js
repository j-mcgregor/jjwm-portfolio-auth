/* eslint-disable no-console */
import config from './config';
import index from './api/app';
import { init } from './lib/mongoDB';
import log from './lib/logger';

const { PORT, MONGODB_URI, MONGODB_NAME } = config;

const startServer = async app => {
  try {
    await init(MONGODB_URI, MONGODB_NAME);
    const appInit = app({ useLogger: true, useMorgan: true });
    log.log('MongoDB connected', true);

    appInit.listen({ port: PORT }, () =>
      log.log(`🚀  Server ready at http://localhost:${PORT}`, true)
    );
  } catch (e) {
    log.err(e, true);
  }
};

startServer(index);
