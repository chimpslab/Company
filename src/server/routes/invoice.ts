import {Router} from "express";
import { isAuthenticated } from "../util/passport";
import * as invoiceController from "../controllers/invoice"
import { body } from "express-validator";

const app = Router();

app.get('/invoice'
    , isAuthenticated
    , invoiceController.manage);
app.post('/invoice/create'
    , isAuthenticated
    , invoiceController.create);
app.post('/invoice/update'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , invoiceController.update);
app.post('/invoice/remove'
    , isAuthenticated
    , body("id", "Id is missing").notEmpty().isAlphanumeric()
    , invoiceController.remove);
app.get('/invoice/read'
    , isAuthenticated
    , invoiceController.read);
export default app;