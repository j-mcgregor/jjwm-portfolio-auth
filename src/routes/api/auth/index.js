import express from 'express';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import User from '../../../models/User';
import {
  getItem,
  getItems,
  insertItem,
  updateItem
} from '../../../lib/mongoDB';
import authMiddleware from '../../../lib/authMiddleware';
import hashPassword from '../../../lib/bcryptHelpers';

const router = express.Router();

const sendResponse = (fn, key, message, status) => {
  return fn.status(status).json({ errors: { [key]: message } });
};
/**
 @route    POST /auth/login
 @desc     Login in a User
 @access   Public
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendResponse(
      res,
      'missingFields',
      'Please include an email and password',
      422
    );
  }

  try {
    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });
    if (!user) throw 'User not found';

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw 'Wrong password amigo!';

      const body = {
        id: user.id,
        email: user.email,
        dob: user.dob,
        firstName: user.firstName,
        lastName: user.lastName
      };

      const token = await jwt.sign(body, config.secret, { expiresIn: 3600 });

      const [header, payload, signature] = token.split('.');

      res.cookie('COOKIE_1', `${header}.${payload}`, {
        expires: new Date(Date.now() + 1800000)
      });

      res.cookie('COOKIE_2', signature, { httpOnly: true });

      const resUser = { email: user.email, id: user._id };
      res.status(200).json({ user: resUser, token, auth: true });
    } catch (e) {
      return sendResponse(res, 'password', 'Wrong password amigo!', 400);
    }
  } catch (error) {
    return sendResponse(res, 'email', error, 400);
  }
});

/**
 @route    POST /auth/register
 @desc     Register a User
 @access   Public
 */

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;

  if (!firstName || !lastName || !email || !password || !password2) {
    return sendResponse(res, 'missingFields', 'Some fields are missing', 400);
  }
  if (password !== password2) {
    return sendResponse(res, 'password', "Passwords don't match", 400);
  }

  try {
    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    if (user) throw { field: 'email', message: 'Email already exists' };

    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    const salt = await bcrypt.genSalt(10);

    try {
      const hash = await hashPassword(newUser.password, salt);
      if (!hash) throw 'Something went wrong while hashing the password';
      newUser.password = hash;
    } catch (error) {
      return sendResponse(res, 'bcrypt', error, 500);
    }

    try {
      const userSaved = await insertItem({
        collectionName: 'users',
        item: newUser
      });
      if (!userSaved) throw 'Something went wrong while saving the user';
      return res.status(200).json({ message: 'Success' });
    } catch (error) {
      return sendResponse(res, 'saveUserError', error, 500);
    }
  } catch (e) {
    return sendResponse(res, e.field, e.message, 400);
  }
});

/**
 @route    GET /auth/verifyUser
 @desc     Verify a user using the custom authMiddleware 
 @access   Private
 */

router.get('/verifyUser', authMiddleware, (req, res) => {
  return res.status(200).json({ isAuthenticated: true });
});

/**
 @route    GET /auth/logout
 @desc     Logout the user 
 @access   Public
 */

router.get('/logout', (req, res) => {
  res.cookie('COOKIE_1', '');
  res.cookie('COOKIE_2', '');

  return res.status(200).json({ loggedOut: true, isAuthenticated: false });
});

/**
 @route    GET /auth/currentUser
 @desc     Get the current user based on the custom middleware 
 @access   Private
 */

router.get('/currentUser', authMiddleware, async (req, res) => {
  const { email } = req.user;

  try {
    const u = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    const user = {
      email: u.email,
      id: u._id
    };

    return res.status(200).json({ user });
  } catch (e) {
    return sendResponse(res, 'currentUser', 'Something went wrong', 400);
  }
});

/**
 @route    GET /auth/changePassword
 @desc     Verify the password for the option of changing password
 @access   Private
 */

router.post('/changePassword', authMiddleware, async (req, res) => {
  const { email, password, newPassword, newPasswordConfirm } = req.body;

  try {
    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    try {
      const match = await bcrypt.compare(password, user.password);

      if (!match) throw new Error('You must enter your current password');
      if (newPassword !== newPasswordConfirm)
        throw new Error('Passwords dont match');

      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);
        if (!hash) throw new Error('Couldnt find a user with that email');
        user.password = hash;

        await updateItem({
          collectionName: 'users',
          email,
          value: user
        });

        return res.status(200).json({ message: 'Success' });
      } catch (e) {
        return sendResponse(res, 'hashPassword', e, 400);
      }
    } catch (e) {
      return sendResponse(res, 'changePassword', e, 400);
    }
  } catch (e) {
    return sendResponse(res, 'noEmail', e, 400);
  }
});

export default router;
