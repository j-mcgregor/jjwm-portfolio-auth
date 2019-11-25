import dotenv from 'dotenv';

dotenv.config();

export default {
  port: parseInt(process.env.PORT, 10),
  db: process.env.MONGODB_URI,
  secret: process.env.SECRET,
  sessionSecret: process.env.SESSION_SECRET
};
