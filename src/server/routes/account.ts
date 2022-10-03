import { Router, Request, Response, NextFunction } from "express";
import * as passportConfig from "../util/passport";
import * as userController from "../controllers/user";
import { body, sanitize } from "express-validator";

export let isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
    return next();
    // req.flash("warnings", "Try to access unauthorized page. This error will be reported");
    // if (req.query.ajax || req.body.ajax) return res.status(403).send(req.flash());
    // res.redirect(`/`);
}

const app = Router();

app.get("/logout",
    userController.logout);

app.get("/invite",
    passportConfig.isAuthenticated, isAuthorized,
    userController.getInvite);
app.post("/invite",
    body("email", "Please enter a valid email address.").isEmail(),
    sanitize("email").normalizeEmail({ gmail_remove_dots: false }),
    passportConfig.isAuthenticated, isAuthorized,
    userController.postInvite);

app.get("/account",
    passportConfig.isAuthenticated,
    userController.getAccount);

app.post("/account/profile",
    body("email", "Please enter a valid email address.").isEmail(),
    sanitize("email").normalizeEmail({ gmail_remove_dots: false }),
    passportConfig.isAuthenticated,
    userController.postUpdateProfile);

app.post("/account/delete",
    passportConfig.isAuthenticated,
    userController.postDeleteAccount);

app.post("/account/consent",
    passportConfig.isAuthenticated,
    userController.postConsent);

app.get("/login",
    userController.request2FA);
app.post("/login",
    body("email", "Please specify your mail address").isEmail(),
    userController.post2FA);
app.post("/auth/verify2fa",
    body("token", "Please specify the code we send you to your email").notEmpty(),
    userController.verify2FA);


export default app;