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

// app.get("/login",
//     userController.getLogin);
// app.post("/login",
//     body("email", "Email is not valid").isEmail(),
//     body("password", "Password cannot be blank").notEmpty(),
//     sanitize("email").normalizeEmail({ gmail_remove_dots: false }),
//     userController.postLogin);

app.get("/logout",
    userController.logout);
app.get("/forgot",
    userController.getForgot);
app.post("/forgot",
    body("email", "Please enter a valid email address.").isEmail(),
    sanitize("email").normalizeEmail({ gmail_remove_dots: false }),
    userController.postForgot);

app.get("/reset/:token",
    userController.getReset);
app.post("/reset/:token",
    body("password", "Password must be at least 4 characters long").isLength({min: 4}),
    body("confirmPassword", "Passwords do not match").custom( async (val, {req}) => {
        if(val !== req.body.password){
          throw new Error('Password confirmation does not match password')
        }
    }),
    userController.postReset);
// app.get("/signup", userController.getSignup);
// app.post("/signup", userController.postSignup);

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

app.post("/account/password",
    body("password", "Password must be at least 4 characters long").isLength({min: 4}),
    body("confirmPassword", "Passwords do not match").custom( async (val, {req}) => {
        if(val !== req.body.password){
          throw new Error('Password confirmation does not match password')
        }
    }),
    passportConfig.isAuthenticated,
    userController.postUpdatePassword);

app.post("/account/delete",
    passportConfig.isAuthenticated,
    userController.postDeleteAccount);

app.post("/account/consent",
    passportConfig.isAuthenticated,
    userController.postConsent);

app.post("/account/endpoint",
    body("name", "name must be at least 4 characters long.").isLength({ min: 4 }),
    body("organization", "organization must be at least 4 characters long.").isLength({ min: 2 }),
    body("user", "user must be at least 4 characters long.").isLength({ min: 4 }),
    body("salt", "user must be at least 4 characters long.").isLength({ min: 4 }),
    userController.postEndpoint);

app.post("/account/validateendpoint",
    body("token", "user must be at least 4 characters long.").isLength({ min: 4 }),
    passportConfig.isAuthenticated,
    userController.postValidateEndpoint);

app.all("/auth",
    passportConfig.isAuthenticated, (req: Request, res: Response) => { res.send(200); });
app.get("/login",
    userController.request2FA);
app.post("/login",
    userController.post2FA);
app.post("/auth/verify2fa",
    userController.verify2FA);


export default app;