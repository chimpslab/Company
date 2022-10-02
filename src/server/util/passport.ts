import passport from "passport";
import passportLocal from "passport-local";
import passportAuth from "passport-auth-token";
import _ from "lodash";

// import { User, UserType } from '../models/User';
import { AuthToken, User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ERoles } from "../models/Role";
import logger from "./logger";
import { DateTime } from "luxon";

const LocalStrategy = passportLocal.Strategy;
const AuthTokenStrategy = passportAuth;

passport.serializeUser<any, any>((req, user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, null, null, (err, user) => {
    done(err, user);
  });
});


/**
 * Sign in using Email and Password.
 */
passport.use("local", new LocalStrategy({ usernameField: "email" },
  (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, null, null, (err, user: any) => {
      if (err) { return done(err); }
      if (!user) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) { return done(err); }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, { message: "Invalid email or password." });
      });
    });
}));

passport.use("authtoken", new AuthTokenStrategy((token: string, done) => {

  console.log("Now checking auth");
  User.find({}, (err: Error, users: UserDocument) => {

    if (err) done(err);

    let Token: AuthToken;
    const user = _.find(users, u => {
      Token = _.find(u.tokens, t => {
        if ( t
          && t.kind == "2FA"
          && t.accessToken == token
          && DateTime.now() < DateTime.fromJSDate(t.expire)) {
            return true;
        }
        return false;
      });
      return Token ? true : false;
    });

    if (!Token || !user) done(undefined, false);

    logger.debug("Verify 2fa", {Token, user, token});
    if (user) {
      done(undefined, user);
    }
    else {
      done(undefined, false);
    }
  });
 }));

/**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  logger.debug("CHECK Authenticated with TOKEN");
  if (req.isAuthenticated()) {
    logger.debug("CHECK Authenticated YAY");
    if (req.user.role != ERoles.disabled) {
      // console.log("GRANT Authenticated with TOKEN");

      return next();
    }
  }
  else {
    logger.debug("CHECK Authenticated NO");
    if (req.xhr) return res.send(403);
    res.redirect("/login");
  }
};

/**
 * Authorization Required middleware.
 */
export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
  const provider = req.path.split("/").slice(-1)[0];

  if (_.find(req.user.tokens, { kind: provider })) {
    next();
  } else {
    res.redirect(`/auth/${provider}`);
  }
};
