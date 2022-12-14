import {Router} from "express";
import { isAuthenticated } from "../util/passport";
import * as invoiceController from "../controllers/invoice"
import { body } from "express-validator";

const app = Router();

app.get('/'
    , isAuthenticated
    , invoiceController.manage);
app.post('/create'
    , isAuthenticated
    , invoiceController.create);
app.post('/update'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , invoiceController.update);
app.post('/remove'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , invoiceController.remove);
app.get('/read'
    , isAuthenticated
    , invoiceController.read);
export default app;