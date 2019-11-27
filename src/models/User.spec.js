/* eslint-disable no-console */
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import User from './User';

const userData = {
  firstName: 'Baloo',
  lastName: 'Baboo',
  dob: new Date(),
  email: 'baloo@baboo.com',
  password: 'password'
};

describe('User Model Test', () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGOD__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  it('create & save user successfully', () => {
    const validUser = new User(userData);

    validUser.save().then(savedUser => {
      // Object Id should be defined when successfully saved to MongoDB.
      expect(savedUser._id).toBeDefined();
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.email).toBe(userData.email);
    });
  });

  // Test Schema is working!!!
  // You shouldn't be able to add in any field that isn't defined in the schema
  it('insert user successfully, but the field does not defined in schema should be undefined', () => {
    const userWithInvalidField = new User({
      firstName: 'Baloo',
      lastName: 'Baboo',
      email: 'Baboo@baboo.com',
      nickname: 'Handsome TekLoon'
    });
    userWithInvalidField.save().then(savedUserWithInvalidField => {
      expect(savedUserWithInvalidField._id).toBeDefined();
      expect(savedUserWithInvalidField.nickkname).toBeUndefined();
    });
  });

  // Test Validation is working!!!
  // It should us told us the errors in on gender field.
  it('create user without required field should failed', () => {
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
