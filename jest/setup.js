const config = require('../src/config')

module.exports = async () => {
  // ...
  // Set reference to mongod in order to close the server during teardown.
  global.__MONGOD__ = config.MONGO_URI_TEST;
  global.__MONGO_DB_NAME__ = config.MONGO_DB_NAME_TEST;
};
