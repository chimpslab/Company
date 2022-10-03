import passport from "passport";
import passportLocal from "passport-local";
import passportAuth from "passport-auth-token";
import _ from "lodash";

// import { User, UserType } from '../models/User';
import { AuthToken, User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { ERoles } from "../models/Role";
import { DateTime } from "luxon";

const AuthTokenStrategy = passportAuth;

passport.serializeUser<any, any>((req, user, done) => {
  done(undefined, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, null, null, (err, user) => {
    done(err, user);
  });
});

passport.use("authtoken", new AuthTokenStrategy((token: string, done) => {

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
  if (req.isAuthenticated()) {
    if (req.user.role != ERoles.disabled) {
      return next();
    }
  }
  if (req.xhr) return res.send(403);
  res.redirect("/login");
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
