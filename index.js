/* eslint-disable no-console */
import express from "express";
import mongoose from "mongoose";
import logger from "morgan";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import config from "./config";
import passportConfig from "./config/passport";
import auth from "./src/routes/api/auth";

const { port, db, sessionSecret } = config;

const app = express();
app.use(logger("dev"));

mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

app.use(helmet());
console.log("Middleware added: helmet");
app.use(cookieParser());
console.log("Middleware added: cookie-parser");

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: "GET,PUT,POST,DELETE,OPTIONS",
  headers:
    "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json,x-xsrf-token"
};

app.use(cors(corsOptions));
console.log("Middleware added: cookie");

app.use(
  session({
    secret: sessionSecret,
    cookie: {
      secure: true,
      httpOnly: true
    },
    saveUninitialized: false,
    resave: false
  })
);
console.log("Middleware added: express-session");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
console.log("Middleware added: body-parser");
app.use(passport.initialize());
console.log("Middleware added: passport");
passportConfig(passport);

app.use("/auth", auth);

app.listen({ port }, () =>
  console.log("🚀 Server ready at", `http://localhost:${port}`)
);
