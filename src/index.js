/* eslint-disable no-console */
import mongoose from 'mongoose';
import config from './config';
import index from './api/app';

const { port, db } = config;

const startServer = async (app) => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB connected');

    app.listen({ port }, () =>
      console.log('🚀 Server ready at', `http://localhost:${port}`)
    );
  } catch (error) {
    console.log(error);
  }
}

startServer(index);
