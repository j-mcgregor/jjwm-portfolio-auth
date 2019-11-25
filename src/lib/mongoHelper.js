/* eslint-disable no-console */
import { MongoClient } from 'mongodb';
import config from '../../config';

const { user, pass, uri, mongoPort, mongoDb } = config;

export const mongoURL = `mongodb://${user}:${pass}@${uri}:${mongoPort}/${mongoDb}?authSource=${mongoDb}&w=1`;

export const mongoOptions = {
  useUnifiedTopology: true,
  useNewUrlParser: true
};

async function mongoConnector() {
  const client = await MongoClient.connect(mongoURL, mongoOptions).catch(
    err => {
      console.log(err);
    }
  );

  if (!client) {
    return;
  }

  return client;
}

export default mongoConnector;
