// 2019 BrightNightGames. All Rights Reserved

import async from "async";
import crypto from "crypto";
import passport from "passport";
import { User, UserDocument, AuthToken, IAgreement, EAccountHistoryEventType } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import "../util/passport";
import _ from "lodash";

import { mail_transport } from "../util/secrets";
import logger from "../util/logger";
import { ValidationError, validationResult } from "express-validator";
import { DateTime } from "luxon";
import { _x } from "../util/i18n";
/**
 * GET /login
 * Login page.
 */
export let getLogin = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/login", {
    title: "Login"
  });
};

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  
  logger.debug(" Login" + JSON.stringify(req.body))

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/login");
  }
  logger.debug(" no error, continue")

  passport.authenticate("local", (err: Error, user: UserDocument, info: IVerifyOptions) => {
    logger.debug(" local" +  JSON.stringify(user || {err, user}))
    if (err) { return next(err); }
    if (!user) {
      req.flash("errors", info.message);
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      logger.debug(" local LOGGED IN " +  JSON.stringify({err, user} || {err}))

      if (err) { return next(err); }
      req.flash("success", "Success! You are logged in.");
      res.redirect("/");
    });
  })(req, res, next);
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout(() => {
    res.redirect("/");

  });
};

/**
 * GET /signup
 * Signup page.
 */
export let getSignup = (req: Request, res: Response) => {
  if (req.user) {
    return res.redirect("/");
  }
  res.render("account/signup", {
    title: "Create Account"
  });
};

/**
 * POST /signup
 * Create a new local account.
 */
export let postSignup = (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/signup");
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, null, null, (err, existingUser) => {
    if (err) { return next(err); }
    if (existingUser) {
      req.flash("errors", "Account with that email address already exists.");
      return res.redirect("/signup");
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect("/");
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
export let getAccount = (req: Request, res: Response) => {
  res.render("account/profile", {
    title: "Account Management"
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
export let postUpdateProfile = (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/account");
  }

  User.findById(req.user.id, null, null, (err, user) => {
    if (err) { return next(err); }
    user.email = req.body.email || "";
    user.profile.name = req.body.name || "";
    user.profile.gender = req.body.gender || "";
    user.profile.location = req.body.location || "";
    user.profile.website = req.body.website || "";
    user.save((err: NativeError) => {
      if (err) {
        // if (err.code === 11000) {
        //   req.flash("errors", { msg: "The email address you have entered is already associated with an account." });
        //   return res.redirect("/account");
        // }
        return next(err);
      }
      req.flash("success", "Profile information has been updated.");
      res.redirect("/account");
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
export let postDeleteAccount = (req: Request, res: Response, next: NextFunction) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logOut( (err) => {
      req.flash("info", "Your account has been deleted.");
      res.redirect("/");
    });
    
  });
};

/**
 * POST /account/consent
 * Store cookie / EULA consent.
 */
export let postConsent = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  User.findById(req.user.id, null, null, (err, user) => {

    if (req.body.consent == "cookie") {
      const cookies = {
        necessary:  _.isArray(req.body.necessary) ? req.body.necessary : [req.body.necessary],
        preferences: _.isArray(req.body.preferences) ? req.body.preferences : [req.body.preferences],
      };
      const selection: Array<IAgreement> = [];
      switch (req.body.preset) {
        case "necessary":
          _.forEach(cookies.necessary, c => {selection.push({title: c, status: "Accepted", date: new Date()}); });
          _.forEach(cookies.preferences, c => {selection.push({title: c, status: "Declined", date: new Date()}); });
          break;
        case "selection":
          _.forEach(cookies.necessary, c => {selection.push({title: c, status: "Accepted", date: new Date()}); });
          _.forEach(cookies.preferences, c => {selection.push({title: c, status: req.body.category_preferences == "on" ? "Accepted" : "Declined", date: new Date()}); });
          break;
        case "all":
          _.forEach(cookies.necessary.concat(cookies.preferences), c => {selection.push({title: c, status: "Accepted", date: new Date()}); });
          break;
      }
      console.log(selection);

      user.agreements = selection;
      if (!user.history) user.history = [];
      user.history.push({type: EAccountHistoryEventType.HISTORY_CONSENT_CHANGED, date: new Date(), note: req.body.preset});

      user.save( (err, document) => {
        if (err) req.flash("errors", err.message);
        else req.flash("success", "Your Cookie preferences are saved with success!");
        res.redirect(req.get("referer"));
      });
    }
  });
};

export let request2FA = (req: Request, res: Response, next: NextFunction) => {
  res.render("account/request2fa", {
    title: _x("Two Factor Authentication", "2fa subsystem"),
  });
};

export let post2FA = (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/login");
  }

  if (req.body.email) {
    User.issueToken(req.body.email, "2FA", 8, 5, true )
    .then(result => {
      const msg = {
        to: result.user.email,
        from: process.env.MAILING_EMAIL,
        subject: "Company - One Time Password",
        // text: Mustache.render(req.body.text, k),
        text: `You are receiving this email because you requested a Two Factor Authentication.\n\n
        Please copy on the following code, and use it to identify\n\n
         ${result.token.accessToken}\n\n
        If you did not request this, please ignore this email.\n`,
      };
      mail_transport.send(msg).then((value) => {
          req.flash("info", `An e-mail has been sent to your email with further instructions.`);

          if ( req.xhr ) {
            res.send(req.flash());
          }
          else {
            return res.render("account/verify2fa", {
              title: _x("Two Factor Authentication", "2fa subsystem"),
              token: result.token,
            });
          }
      });
    })
    .catch((e: Error) => {
      logger.error( "Error during 2FA Request " + e.message);
      req.flash("errors", e.message);
      res.redirect("/login");
    });

  }

};

export let verify2FA = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.token) {
    passport.authenticate("authtoken", async (err: Error, user: UserDocument, info: IVerifyOptions) => {
      if (err) { return res.redirect("/login"); }
      if (!user) {
        req.flash("errors", info.message);
        return res.redirect("/login");
      }
      user.tokens = _.filter(user.tokens, t => t.kind != "2FA");
      user.save((err, u) => {
          if (err) { return res.redirect("/login"); }
          req.login(u, (err) => {
            if (err) { return res.redirect("/login"); }

            req.flash("success", "Success! You are logged in." );
            // res.redirect(req.session.returnTo || "/");
            res.redirect("/");
        });
      });
    })(req, res, next);
  }
  else {
    req.flash("errors", "Error during 2FA Check");
    res.redirect("/login");
  }
};

function ErrToFlashReq(req: Request, errs: ValidationError[]) {
    return _.forEach(errs, (e) => {
        req.flash("errors", e.msg)
    })
}

/**
 * GET /invite
 * Create a random token, then the send user an email with a invite link.
 */
export let getInvite = (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect("/");
  }
  res.render("account/invite", {
    title: "Invite"
  });
};

/**
 * POST /invite
 * Create a random token, then the send user an email with a invite link.
 */
export let postInvite = (req: Request, res: Response, next: NextFunction) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/invite");
  }
  
  async.waterfall([
    function createRandomToken(done: Function) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    function setRandomToken(token: string, done: Function) {
      User.findOne({ email: req.body.email }, null, null, (err, user) => {
        if (err) { return done(err); }
        if (user) {
          req.flash("errors", "Account with that email address already exist.");
          return res.redirect("/invite");
        }
        else {
          user = new User({
            email: req.body.email,
            passwordResetToken: token,
            passwordResetExpires: DateTime.now().plus({ hour: 1 }) // 1 hour
          });

          user.save((err) => {
            done(err, token, user);
          });
        }
      });
    },
    function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: Function) {
      const msg = {
        to: user.email,
        from: process.env.MAILING_EMAIL,
        subject: "Company - Invitation",
        // text: Mustache.render(req.body.text, k),
        text: `You are receiving this email because you have been invited to create an account on Company.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          You will be requested to setup a password.\n\n`
      };
      mail_transport.send(msg).then((value) => {
          req.flash("info", `An e-mail has been sent to ${user.email} with further instructions.`);

          done(undefined, value[0]);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/invite");
  });
};


