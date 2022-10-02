// 2019 BrightNightGames. All Rights Reserved

import async from "async";
import crypto from "crypto";
import passport from "passport";
import { User, UserDocument, AuthToken, IAgreement, EAccountHistoryEventType } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import "../util/passport";
import _ from "lodash";

import { mail_transport } from "../util/secrets";
import logger from "../util/logger";
import * as fs from "fs";
import * as path from "path";
import mustache from "mustache";
import { ValidationError, validationResult } from "express-validator";
import { Organization } from "../models/Organization";
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
 * POST /account/password
 * Update current password.
 */
export let postUpdatePassword = (req: Request, res: Response, next: NextFunction) => {


  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/account");
  }

  User.findById(req.user.id, null, null, (err, user: UserDocument) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash("success", "Password has been changed.");
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
        subject: "SchoolBoard - One Time Password",
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
              state: "providecode",
              token: result.token,
            });
          }
      });
    })
    .catch((e: Error) => {
      logger.error( "Error during 2FA Request" + e.message);
      req.flash("errors", "Error during 2FA Request" + e.message);
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
      logger.debug(" authtoken authenticated " +  JSON.stringify({err, user} || {err}))
      user.tokens = _.filter(user.tokens, t => t.kind != "2FA");
      user.save((err, u) => {
          if (err) { return res.redirect("/login"); }
          req.login(u, (err) => {
            if (err) { return res.redirect("/login"); }
            logger.debug(" authtoken Logged In " +  JSON.stringify({err, u} || {err}))

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

/**
 * GET /reset/:token
 * Reset Password page.
 */
export let getReset = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where("passwordResetExpires").gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash("errors", "Password reset token is invalid or has expired.");
        return res.redirect("/forgot");
      }
      res.render("account/reset", {
        title: "Password Reset"
      });
    });
};

function ErrToFlashReq(req: Request, errs: ValidationError[]) {
    return _.forEach(errs, (e) => {
        req.flash("errors", e.msg)
    })
}

/**
 * POST /reset/:token
 * Process the reset password request.
 */
export let postReset = (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("back");

  }

  async.waterfall([
    function resetPassword(done: Function) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where("passwordResetExpires").gt(Date.now())
        .exec((err, user: any) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash("errors", "Password reset token is invalid or has expired.");
            return res.redirect("back");
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err: WriteError) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function sendResetPasswordEmail(user: UserDocument, done: Function) {
      // const transporter = nodemailer.createTransport({
      //   service: process.env.MAILING_SERVICE,
      //   auth: {
      //     user: process.env.MAILING_SERVICE_USER,
      //     pass: process.env.MAILING_SERVICE_PASSWORD
      //   }
      // });
      // const mailOptions = {
      //   to: user.email,
      //   from: process.env.MAILING_EMAIL,
      //   subject: "SchoolBoard - Your password has been changed",
      //   text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      // };
      // transporter.sendMail(mailOptions, (err) => {
      //   req.flash("success", { msg: "Success! Your password has been changed." });
      //   done(err);
      // });
      const msg = {
        to: user.email,
        from: process.env.MAILING_EMAIL,
        subject: "SchoolBoard - Your password has been changed",
        // text: Mustache.render(req.body.text, k),
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      };
      mail_transport.send(msg).then((value) => {
          done(undefined, value[0]);
      });

      user.history.push({type: EAccountHistoryEventType.HISTORY_ACCOUNT_PASSWORD_RESET_VIA_EMAIL, date: new Date(), note: "Process the reset password request"});

    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/");
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
export let getForgot = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.render("account/forgot", {
    title: "Forgot Password"
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
export let postForgot = (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return res.redirect("/forgot");
  }

  async.waterfall([
    function createRandomToken(done: Function) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString("hex");
        done(err, token);
      });
    },
    function setRandomToken(token: AuthToken, done: Function) {
      User.findOne({ email: req.body.email }, null, null, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
          req.flash("errors", "Account with that email address does not exist.");
          return res.redirect("/forgot");
        }
        user.passwordResetToken = token.accessToken;
        user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function sendForgotPasswordEmail(token: AuthToken, user: UserDocument, done: Function) {

      const msg = {
        to: user.email,
        from: process.env.MAILING_EMAIL,
        subject: "SchoolBoard - Reset Password",
        // text: Mustache.render(req.body.text, k),
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };
      mail_transport.send(msg).then((value) => {
          req.flash("info", `An e-mail has been sent to ${user.email} with further instructions.`);

          user.history.push({type: EAccountHistoryEventType.HISTORY_ACCOUNT_PASSWORD_RESET_CODE_GENERATED, date: new Date(), note: "User request reset password"});

          user.save( (err, u) => {
            done(undefined, value[0]);
          });
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect("/forgot");
  });
};

/**
 * POST /endpoint
 */
export let postEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return next();
  }

  function sendEndpointRegisteredEmail(token: AuthToken, user: UserDocument, done: Function) {

    const msg = {
      to: user.email,
      from: process.env.MAILING_EMAIL,
      subject: "SchoolBoard - Register Endpoint Request",
      html: mustache.render(fs.readFileSync( path.join(process.cwd(), "/views/mailtemplate/endpointRegister.html")).toString("utf8"), {
        user,
        token,
        html: true
      }),
    };
    mail_transport.send(msg).then((value) => {
        req.flash("info", `An e-mail has been sent to ${user.email} with further instructions.`);
        user.save( (err, u) => {
          done(err, value[0]);
        });
    });
  }

  async.parallel({
    user: (cb) => { User.findOne({email: req.body.user}, cb); },
    organization: (cb) => { Organization.findOne({name: req.body.organization}, cb); }
  }, (err, results) => {
    if (!results.user || !results.organization) {
      console.log("Bad results, why ? ", results);
      res.status(404);
      return next();
    }

    const endpoint = {
      name: req.body.name,
      organization: req.body.organization,
      salt: req.body.salt,
      useragent: req.get("User-Agent"),
      address: req.ip
    };

    User.issueToken(req.body.user, "DEV-REQ", 30, 64, true, endpoint).then((pair) => {
      req.flash("success", "Device registration request received with success !");
      pair.user.history.push({type: EAccountHistoryEventType.HISTORY_ACCOUNT_JWT_REQUESTED, date: new Date(), note: `Endpoint request JWT Access ${endpoint.name}`});

      sendEndpointRegisteredEmail(pair.token, pair.user, (err: Error) => {
        if ( err ) {
          req.flash("errors", "Could not send email");
          return res.status(500).send(req.flash());
        }
        req.flash("success", "An email has been sent to you with further instructions, and the precisous token !");
        return res.send(req.flash());
      });
    }).catch(reason => {
        req.flash("errors", reason || "Unknown error");
        return res.status(500).send(req.flash());
    });
  });
};

export let postValidateEndpoint = async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      ErrToFlashReq(req, errors.array());
      return next();
  }

  function sendEndpointValidatedEmail(token: AuthToken, user: UserDocument, done: Function) {

    const msg = {
      to: user.email,
      from: process.env.MAILING_EMAIL,
      subject: "SchoolBoard - Issued Endpoint Token",
      html: mustache.render(fs.readFileSync( path.join(process.cwd(), "/views/mailtemplate/endpointValidate.html")).toString("utf8"), {
        user,
        token,
        html: true
      }),
    };
    mail_transport.send(msg).then((value) => {
        req.flash("info", `An e-mail has been sent to ${user.email} with further instructions.`);
        user.save( (err, u) => {
          done(undefined, value[0]);
        });
    }).catch(reason => {
      done(reason);
    });
  }

  // console.log("REQUEST WITH USER", req);
  if (req.user instanceof User) {

    // search for corresponding token
    const reqtokenIndex = _.findIndex(req.user.tokens, (x) =>  {return x.accessToken == req.body.token; });
    if ( 0 > reqtokenIndex ) {
      req.flash("errors", "You have no devices registered with those credentials");
      return res.status(404).send(req.flash());
    }

    // issue new token with JWT payload
    User.issueToken(req.user.email, "JWT", -1, 256, false, req.user.tokens[reqtokenIndex].userdata)
    .then(pair => {

      // Fill user history
      pair.user.history.push({
        type: EAccountHistoryEventType.HISTORY_ACCOUNT_JWT_ACCEPTED,
        date: new Date(),
        note: `User Accepted JWT Access ${req.user.tokens[reqtokenIndex].userdata.name}`
      });

      // Remove request token from this device
      pair.user.tokens = _.filter(pair.user.tokens, x => {return x.accessToken != req.body.token; });

      pair.user.save((err, u) => {
        sendEndpointValidatedEmail(pair.token, pair.user, () => {
          return res.send(pair.token.accessToken);
        });
      });
    })
    .catch(e => {
      logger.error(e);
      req.flash("errors", `Error during "JWT" Request`);
      return res.status(500).send(req.flash());
    });

  }
  else {
    return res.redirect("/login");
  }
};

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
        subject: "SchoolBoard - Invitation",
        // text: Mustache.render(req.body.text, k),
        text: `You are receiving this email because you have been invited to create an account on SchoolBoard.\n\n
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


