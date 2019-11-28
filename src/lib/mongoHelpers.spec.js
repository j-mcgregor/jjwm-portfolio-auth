import { getMongoConnection, closeMongoConnection } from './mongoHelpers';

const connectionString = global.__MONGO_URI__; // This is coming from @shelf/jest-mongodb
const database = 'test';

describe('Mongo Connection', () => {
  afterEach(async () => {
    await closeMongoConnection();
  });

  it('should be able to connect to Mongo in memory', async () => {
    const mongoConnection = await getMongoConnection({
      connectionString,
      database
    });
    console.log(mongoConnection);
  });
});
