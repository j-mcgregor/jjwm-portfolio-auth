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
    // Fairly straightforward - just test if the connection isn't empty
    expect(mongoConnection).not.toEqual(null);
    expect(mongoConnection.db).not.toEqual(null);
    expect(mongoConnection.connection).not.toEqual(null);
  });

  it('throws an error if an exception happens', async () => {
    // The mongo Port number is incorrect
    const mongoConnection = getMongoConnection({
      connectionString: 'mongodb://127.0.0.1:63282/jest-fake?',
      database
    });
    // .rejects is something to look further into
    return expect(mongoConnection).rejects.toThrow('MongoNetworkError');
  });

  it('retries 4 times before throwing an error', async () => {
    const onError = jest.fn();
    expect.assertions(1);
    try {
      await getMongoConnection({
        retryCount: 4,
        connectionString: 'mongodb://127.0.0.1:63282/jest-fake?',
        database,
        onError // the custom Error message: defaults to null
      });
    } catch {
      expect(onError).toHaveBeenCalledTimes(4);
    }
  });
});
