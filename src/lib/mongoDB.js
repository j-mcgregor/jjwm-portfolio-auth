import { MongoClient, ObjectId, ObjectID } from 'mongodb';
import { mongoOptions } from '../config/index';

ObjectId.prototype.valueOf = function() {
  return this.toString();
};

const mongoConnection = {
  connection: null,
  db: null
};

const delay = retryDelay =>
  new Promise(resolve => setTimeout(() => resolve(), retryDelay));

const retry = ({ fn, retryDelay, retryCount, err = null, onError }) => {
  if (!retryCount) {
    return Promise.reject(err);
  }
  return fn().catch(error => {
    onError(error);
    return delay(retryDelay).then(() =>
      retry({ fn, retryCount: retryCount - 1, err: error, onError, retryDelay })
    );
  });
};

export const init = async (
  connectionUrl = 'mongodb://localhost:27017',
  dbName
) => {
  const uri =
    process.env.NODE_ENV === 'test'
      ? connectionUrl
      : `${connectionUrl}/${dbName}`;

  const fn = () => MongoClient.connect(uri, mongoOptions); // return Promise
  return retry({ fn, retryDelay: 100, retryCount: 3, onError: () => {} }).then(
    connection => {
      if (!connection) throw new Error('no mongo connection set');
      mongoConnection.connection = connection;
      mongoConnection.db = connection.db(dbName);
      return mongoConnection;
    }
  );
};

export const insertItem = ({ collectionName, item }) => {
  const collection = mongoConnection.db.collection(collectionName);
  return collection.insertOne(item);
};

export const getItem = ({ collectionName, key, value }) => {
  const collection = mongoConnection.db.collection(collectionName);
  return collection.findOne({ [key]: value });
};

export const getItems = ({ collectionName }) => {
  const collection = mongoConnection.db.collection(collectionName);
  return collection.find({}).toArray();
};

export const updateItem = ({ collectionName, id, value }) => {
  const collection = mongoConnection.db.collection(collectionName);

  return collection.updateOne(
    { _id: new ObjectID(id) },
    { $set: { value } },
    { upsert: true }
  );
};

export const dropDB = ({ collectionName }) => {
  const collection = mongoConnection.db.collection(collectionName);
  return collection.drop();
};

export const createCollection = ({ collectionName }) => {
  return mongoConnection.db.createCollection(collectionName);
};

// Closes and resets the mongoConnection object
export const closeMongoConnection = () => {
  if (mongoConnection.connection) {
    mongoConnection.connection.close();
    mongoConnection.connection = null;
    mongoConnection.db = null;
  }
};

export default {
  init,
  insertItem,
  getItem,
  getItems,
  updateItem,
  closeMongoConnection,
  dropDB,
  createCollection
};
