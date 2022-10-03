import {Router} from "express";
import { isAuthenticated } from "../util/passport";

import * as organizationController from "../controllers/organization";
import { body } from "express-validator";

const app = Router();

app.get('/organization'
    , isAuthenticated
    , organizationController.manage);
app.post('/organization/create'
    , isAuthenticated
    , organizationController.create);
app.post('/organization/update'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , organizationController.update);
app.post('/organization/remove'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , organizationController.remove);
app.get('/organization/read'
    , isAuthenticated
    , organizationController.read);
export default app;