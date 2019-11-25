/* eslint-disable no-console */

import faker from 'faker';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from '../config';
import User from '../src/models/User';

mongoose.Promise = require('bluebird');

mongoose.connect(config.db, { useNewUrlParser: true });

User.collection.drop();

async function seedUser() {
  const users = [];
  for (let i = 0; i < 10; i++) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('password', salt);

    const newUser = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      dob: faker.date.between('1990-01-01', '2010-01-05'),
      email: `test${i + 1}@test.com`,
      password: hash
    };
    users.push(newUser);
  }

  await User.create(users)
    .then(users => console.log(`${users.length} users created`))
    .catch(err => console.log(err))
    .finally(() => mongoose.connection.close());
}

async function init() {
  console.log('Seeding users...');
  await seedUser();
}

init();
