/* eslint-disable no-console */
import mongoose from 'mongoose';
import * as mdb from '../lib/mongoDB';
import User from './User';

const connectionString = global.__MONGO_URI__;
const database = 'test';

describe('User Model Test', () => {
  beforeAll(async () => {
    await mdb.init(connectionString, database);
  });

  afterEach(async () => {
    await mdb.dropDB({ collectionName: 'users' });
    await mdb.createCollection({ collectionName: 'users' });
  });

  afterAll(async () => {
    await mdb.closeMongoConnection();
  });

  it('should insert a doc into collection', async () => {
    const mockUser = { _id: 'some-user-id', name: 'John' };

    const insertedUser = await mdb.insertItem({
      collectionName: 'users',
      item: mockUser
    });
    expect(insertedUser.ops[0]).toEqual(mockUser);
  });

  it('create & save user successfully', async () => {
    const userData = {
      firstName: 'Baloo',
      lastName: 'Baboo',
      dob: new Date(),
      email: 'baloo@baboo.com',
      password: 'password'
    };

    const validUser = new User(userData);

    const savedUser = await mdb.insertItem({
      collectionName: 'users',
      item: validUser
    });

    expect(savedUser.ops[0]._id).toBeDefined();
    expect(savedUser.ops[0].firstName).toBe(userData.firstName);
    expect(savedUser.ops[0].lastName).toBe(userData.lastName);
    expect(savedUser.ops[0].email).toBe(userData.email);
  });
  it('insert user successfully, but the field does not defined in schema should be undefined', async () => {
    const userWithInvalidField = new User({
      firstName: 'Baloo',
      lastName: 'Baboo',
      email: 'Baboo@baboo.com',
      nickname: 'Handsome TekLoon'
    });

    const savedUser = await mdb.insertItem({
      collectionName: 'users',
      item: userWithInvalidField
    });

    expect(savedUser.ops[0]._id).toBeDefined();
    expect(savedUser.ops[0].nickkname).toBeUndefined();
  });

  it('create user without required field should failed', async () => {
    const userWithoutRequiredField = new User({ firstName: 'TekLoon' });

    userWithoutRequiredField
      .save()
      .then(user => user)
      .catch(err => {
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
      });
  });
});
