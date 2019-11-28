import mongo, { ObjectID } from 'mongodb';

// >>>>>>>>>>>>>>>>>>>>>
// ObjectID from Mongo is it's own data type, so to make it more useful we can add a prototype to convert it to a string
// eslint-disable-next-line func-names
ObjectID.prototype.valueOf = function() {
  return this.toString();
};

// >>>>>>>>>>>>>>>>>>>>>
// Takes in a value for ms, returns a Promise.resolve
const delay = retryDelay =>
  new Promise(resolve => setTimeout(() => resolve(), retryDelay));

// >>>>>>>>>>>>>>>>>>>>>
// Recursive function; takes in a function (callback) and a count among other things
// The retry count reduced by one every time it's recursively called until its falsy, when it returns Promise.reject
const retry = ({ fn, retryDelay, retryCount, err = null, onError }) => {
  if (!retryCount) {
    return Promise.reject(err);
  }
  return fn().catch(error => {
    // console.log('error')
    onError(error);
    return delay(retryDelay).then(() =>
      retry({ fn, retryCount: retryCount - 1, err: error, onError, retryDelay })
    );
  });
};

// >>>>>>>>>>>>>>>>>>>>>
// placeholder values for mongoConnection
const mongoConnection = {
  connection: null,
  db: null
};

// >>>>>>>>>>>>>>>>>>>>>
// Uses various mongo and custom info to set up a mongo connection, employing the retry() above
// If successful then it reassigns the placeholder mongoConnection
const createMongoConnection = ({
  connectionString,
  connectionOptions,
  database,
  retryDelay,
  retryCount,
  onError
}) => {
  const fn = () =>
    mongo.MongoClient.connect(connectionString, connectionOptions);
  return retry({ fn, retryDelay, retryCount, onError }).then(connection => {
    if (!connection) throw new Error('no mongo connection set');
    mongoConnection.connection = connection;
    mongoConnection.db = connection.db(database);
    return mongoConnection;
  });
};

// >>>>>>>>>>>>>>>>>>>>>
// Closes and resets the mongoConnection object
const closeMongoConnection = () => {
  if (mongoConnection.connection) {
    mongoConnection.connection.close();
    mongoConnection.connection = null;
    mongoConnection.db = null;
  }
};

// >>>>>>>>>>>>>>>>>>>>>
// Setting up the function to use them all together with default values if none are passed
const getMongoConnection = ({
  connectionString = '',
  connectionOptions = {},
  database,
  retryDelay = 100,
  retryCount = 3,
  onError = () => {}
}) => {
  // Checks if there's an existing connection
  if (mongoConnection.db) {
    return Promise.resolve(mongoConnection);
  }
  return createMongoConnection({
    connectionString,
    connectionOptions,
    database,
    retryDelay,
    retryCount,
    onError
  });
};

export { getMongoConnection, ObjectID, closeMongoConnection };
