/* eslint-disable no-console */
import config from './config';
import index from './api/app';
import { init } from './lib/mongoDB';

const { PORT, MONGODB_URI, MONGODB_NAME } = config;

const startServer = async app => {
  try {
    await init(MONGODB_URI, MONGODB_NAME);
    console.log('MongoDB connected');

    app.listen({ port: PORT }, () =>
      console.log('🚀 Server ready at', `http://localhost:${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

startServer(index);
