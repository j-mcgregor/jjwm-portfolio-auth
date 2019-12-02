import { MongoClient, ObjectId } from 'mongodb';
import { mongoOptions } from '../config/index';

const mongoConnection = {
  connection: null,
  db: null
};

export const init = async (
  connectionUrl = 'mongodb://localhost:27017',
  dbName
) => {
  const uri =
    process.env.NODE_ENV === 'test'
      ? connectionUrl
      : `${connectionUrl}/${dbName}`;
  const client = await MongoClient.connect(uri, mongoOptions);
  mongoConnection.db = client.db(dbName);
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
  return collection.updateOne({ _id: ObjectId(id) }, { $inc: { value } });
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
