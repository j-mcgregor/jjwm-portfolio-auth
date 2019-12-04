/* eslint-disable import/no-named-as-default */
/* eslint-disable consistent-return */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../../config';
import User from '../../../models/User';
import { getItem, insertItem, updateItem } from '../../../lib/mongoDB';
import authMiddleware from '../../../lib/authMiddleware';
import hashPassword from '../../../lib/bcryptHelpers';
import sendError from '../../../lib/sendError';

const router = express.Router();
/**
 @route    POST /auth/login
 @desc     Login in a User
 @access   Public
 */

router.post('/login', async (req, res, next) => {
  const { email = '', password = '' } = req.body;

  try {
    if (!email || !password) {
      throw {
        key: 'missing_fields',
        message: 'Please include an email and password'
      };
    }

    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    if (!user) throw { key: 'email', message: 'User not found' };

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) throw { key: 'password', message: 'Wrong password amigo!' };

      const body = {
        id: user.id,
        email: user.email,
        dob: user.dob,
        firstName: user.firstName,
        lastName: user.lastName
      };

      const token = await jwt.sign(body, config.SECRET, { expiresIn: 3600 });
      if (!token) {
        throw { key: 'token_error', message: 'Error signing the token' };
      }

      const [header, payload, signature] = token.split('.');

      res.cookie('COOKIE_1', `${header}.${payload}`, {
        expires: new Date(Date.now() + 1800000)
      });

      res.cookie('COOKIE_2', signature, { httpOnly: true });

      const resUser = { email: user.email, id: user._id };
      res.status(200).json({ user: resUser, token, auth: true });
    } catch (e) {
      sendError(next, res, e.key, e.message, 400);
    }
  } catch (e) {
    sendError(next, res, e.key, e.message, 400);
  }
});

/**
 @route    POST /auth/register
 @desc     Register a User
 @access   Public
 */

router.post('/register', async (req, res, next) => {
  const { firstName, lastName, email, password, password2 } = req.body;

  try {
    if (!firstName || !lastName || !email || !password || !password2) {
      throw { key: 'missing_fields', message: 'Some fields are missing' };
    }
    if (password !== password2) {
      throw { key: 'password', message: 'Passwords dont match' };
    }

    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    if (user) throw { key: 'email', message: 'Email already exists' };

    const newUser = new User({
      firstName,
      lastName,
      email,
      password
    });

    try {
      const salt = await bcrypt.genSalt(10);
      const hash = await hashPassword(newUser.password, salt);
      if (!hash || !salt) {
        throw {
          key: 'bcrypt',
          message: 'Something went wrong while hashing the password'
        };
      }

      newUser.password = hash;

      try {
        const userSaved = await insertItem({
          collectionName: 'users',
          item: newUser
        });

        if (!userSaved) {
          throw {
            key: 'save_user_error',
            message: 'Something went wrong while saving the user'
          };
        }

        return res.status(200).json({ message: 'Success' });
      } catch (e) {
        sendError(next, res, e.key, e.message, 500);
      }
    } catch (e) {
      sendError(next, res, e.key, e.message, 500);
    }
  } catch (e) {
    sendError(next, res, e.key, e.message, 400);
  }
});

/**
 @route    GET /auth/verifyUser
 @desc     Verify a user using the custom authMiddleware
 @access   Private
 */

router.get('/verifyUser', authMiddleware, (req, res) => {
  if (res.errors) {
    const { message } = res.errors;
    return res.status(400).json({
      errors: { isAuthenticated: false, message }
    });
  }
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
    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    if (!user) {
      throw { key: 'email', message: 'Couldnt find a user with that email' };
    }

    const u = {
      email: user.email,
      id: user._id
    };

    return res.status(200).json({ user: u });
  } catch (e) {
    return res.status(400).json({ errors: { [e.key]: e.message } });
  }
});

/**
 @route    GET /auth/changePassword
 @desc     Verify the password for the option of changing password
 @access   Private
 */

router.post('/changePassword', authMiddleware, async (req, res, next) => {
  const {
    email = '',
    password = '',
    newPassword = '',
    newPasswordConfirm = ''
  } = req.body;

  try {
    if (newPassword !== newPasswordConfirm) {
      throw { key: 'password', message: 'Passwords dont match' };
    }

    const user = await getItem({
      collectionName: 'users',
      key: 'email',
      value: email
    });

    if (!user) {
      throw { key: 'email', message: 'Couldnt find a user with that email' };
    }

    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw {
          key: 'password',
          message: 'You must enter your current password'
        };
      }

      try {
        const salt = await bcrypt.genSalt(10);
        const hash = await hashPassword(newPassword, salt);

        if (!hash || !salt) {
          throw {
            key: 'hashing_error',
            message: 'Something went wrong while hashing the password'
          };
        }

        user.password = hash;

        const updateSuccess = await updateItem({
          collectionName: 'users',
          email,
          value: user
        });

        if (!updateSuccess) {
          throw {
            key: 'save_error',
            message: 'Something went wrong while saving the user'
          };
        }

        return res.status(200).json({ message: 'Success' });
      } catch (e) {
        sendError(next, res, e.key, e.message, 500);
      }
    } catch (e) {
      sendError(next, res, e.key, e.message, 400);
    }
  } catch (e) {
    sendError(next, res, e.key, e.message, 400);
  }
});

export default router;
