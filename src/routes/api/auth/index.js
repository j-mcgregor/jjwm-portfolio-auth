import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../../../config";
import User from "../../../models/User";
import authMiddleware from "../../../lib/authMiddleware";

const router = express.Router();

// @route    POST /auth/register
// @desc     Login in a User
// @access   Public

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const errors = {};
  let match;
  const user = await User.findOne({ email });

  if (!user) {
    errors.email = "User not found";
  } else {
    match = await bcrypt.compare(password, user.password);
  }

  if (!match) {
    errors.password = "Wrong password";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const body = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  };

  const token = await jwt.sign(body, config.secret, { expiresIn: 3600 });

  const [header, payload, signature] = token.split(".");

  res.cookie("COOKIE_1", `${header}.${payload}`, {
    expires: new Date(Date.now() + 1800000)
  });
  res.cookie("COOKIE_2", signature, { httpOnly: true });

  res.json({ user, token, auth: true });
});

// @route    POST /users/register
// @desc     Register a User
// @access   Public

router.post("/register", async (req, res) => {
  const { firstName, lastName, email, password, password2 } = req.body;
  const errors = {};
  const user = await User.findOne({ email });

  if (password !== password2) {
    errors.password = "Passwords don't match";
    errors.password2 = "Passwords don't match";
  }

  if (user) {
    errors.email = "Email already exists";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const newUser = new User({
    firstName,
    lastName,
    email,
    password
  });

  const salt = await bcrypt.genSalt(10);

  try {
    const hash = await bcrypt.hash(newUser.password, salt);
    newUser.password = hash;
  } catch (e) {
    res.json(e);
  }

  try {
    const userSaved = await newUser.save();
    res.json({ user: userSaved });
  } catch (e) {
    res.json(e);
  }
});

router.get("/verifyUser", authMiddleware, (req, res, next) => {
  res.json({ isAuthenticated: true });
});

router.get("/logout", (req, res, next) => {
  res.cookie("COOKIE_1", "");
  res.cookie("COOKIE_2", "");

  res.json({ loggedOut: true });
});

router.get("/currentUser", authMiddleware, async (req, res) => {
  const { email } = req.user;

  try {
    const user = await User.findOne({ email });
    res.json({ user });
  } catch (error) {
    res.json({ error });
  }
});

router.post("/verifyPassword", authMiddleware, async (req, res) => {
  const { email, password, newPassword, newPasswordConfirm } = req.body;
  const errors = {};

  const user = await User.findOne({ email });
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    errors.wrongPassword = "You must enter your current password";
  }

  if (newPassword !== newPasswordConfirm) {
    errors.password = "Passwords don't match";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  } else {
    return res.status(201).json({ message: "Success" });
  }
});

export default router;
