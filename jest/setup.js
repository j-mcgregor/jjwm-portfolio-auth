const config = require('../src/config');

module.exports = async () => {
  global.__MONGO_URI__ = config.MONGO_URI_TEST || '';
  global.__MONGO_DB_NAME__ = config.MONGO_DB_NAME_TEST || '';
};
