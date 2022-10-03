import {Router} from "express";
import { isAuthenticated } from "../util/passport";
import * as invoiceController from "../controllers/invoice"

const app = Router();

app.get('/'
    , isAuthenticated
    , invoiceController.getInvoice);
app.post('/'
    , isAuthenticated
    , invoiceController.postInvoice);
app.get('/api'
    , isAuthenticated
    , invoiceController.apiGetInvoice);
export default app;