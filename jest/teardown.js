// teardown.js
module.exports = async function () {
  await global.__MONGO_URI__.stop();
  await global.__MONGO_DB_NAME__.stop();
};
