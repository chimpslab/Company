import {Router} from "express";
import { isAuthenticated } from "../util/passport";
import * as controller from "../controllers/product"
import { body } from "express-validator";

const app = Router();

app.get('/'
    , isAuthenticated
    , controller.manage);
app.post('/create'
    , isAuthenticated
    , controller.create);
app.post('/update'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , controller.update);
app.post('/remove'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , controller.remove);
app.get('/read'
    , isAuthenticated
    , controller.read);
export default app;