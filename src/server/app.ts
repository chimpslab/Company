// 2019 BrightNightGames. All Rights Reserved

import express, { Request, Response, NextFunction } from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import lusca from "lusca";
import flash from "express-flash";
import path from "path";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import passport from "passport";
import luxon from "luxon";
import bluebird from "bluebird";
import _ from "lodash";
import logger from "./util/logger";
import { _x } from "./util/i18n";

// Load environment variables from .env file, where API keys and passwords are configured

// dotenv.config({ path: ".env" });
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
process.env.BODYPARSER_LIMIT = process.env.BODYPARSER_LIMIT || "15mb";

// API keys and Passport configuration
import * as passportConfig from "./util/passport";

// Create Express server
const app = express();

(<any>mongoose).Promise = bluebird;

// Express configuration
app.set("httpport", process.env.HTTPPORT || 80);
app.set("views", [path.join(__dirname, "../../views")]);
app.set("view engine", "pug");

app.locals = {
  env: process.env,
  version: require("/app/package.json").version,
  luxon,
  _,
  _x,
  user_can: (u: any) => {return true;},
  basedir: path.join(__dirname, "../../views"),
};

// app.use(compression());
app.use(express.json({limit: process.env.BODYPARSER_LIMIT}));
app.use(express.urlencoded({limit: process.env.BODYPARSER_LIMIT, extended: true}));
app.use(cookieParser())
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: SESSION_SECRET,
  store: MongoStore.create({
    mongoUrl: MONGODB_URI
  })
}));
app.use(passport.authenticate('session'));

app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

app.use( async (req, res, next) => {
  res.locals.user = req.user;

  if (req.user) {
  }

  next();
});

app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user
    && req.path !== "/login"
    && req.path !== "/signup"
    && !req.path.match(/^\/auth/)
    && !req.path.match(/\./)) 
  {
    logger.debug("Set return address to " + req.path);
  } else if (req.user
    && req.path == "/account") {
    logger.debug(`Set ${req.user.email} return address to ${req.path}`);
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "../client"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */

import * as homeController from "./controllers/home";
app.get("/", passportConfig.isAuthenticated, homeController.index);
app.get("/404", (req: Request, res: Response, next: NextFunction) => { res.render("404", {title: "404"}); });
app.get("/500", (req: Request, res: Response, next: NextFunction) => { res.render("500", {title: "500"}); });
app.get("/legals", (req: Request, res: Response, next: NextFunction) => { res.render("legals", {title: "Legals"}); });

import AccountRouter from "./routes/account"

app.use(AccountRouter);


const lateInit = function() {
  app.use((req: Request, res: Response, next: NextFunction) => {
    const flash = req.flash();
    if (flash && Object.keys(flash).length) {
      if (req.xhr || req.body.ajax)
        return res.send(flash);
    }
    next();
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (res.statusCode == 404) {
      if (req.xhr) return res.status(404).send("Can't find thant !");
      return res.redirect("/404");
    }
    res.redirect("/");
  });
};


export default app;