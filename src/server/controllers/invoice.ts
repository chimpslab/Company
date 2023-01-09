import { NextFunction, Request, Response } from "express";
import { iInvoice, Invoice } from "../models/Invoice";
import fs from "fs"
import path from "path"

const viewPath = path.join(process.env.PWD, "views");
const invoicePath = path.join(viewPath, "markdown/invoice.md")

export const manage = (req: Request, res: Response) => {
    let template = "";

    
    if (fs.existsSync(invoicePath)) {
        template = fs.readFileSync(invoicePath).toString()
    }
    res.render("manage/invoice", {
        title: "Invoice",
        template,
        viewPath, invoicePath
    })
}

export const create = (req: Request, res: Response, next: NextFunction) => {

    const newInvoice = new Invoice({
        name: req.body.name,
        provider: req.body.provider,
        uiid: req.body.uiid,
        totalPaymentDue: req.body.total,
        paymentDueDate: req.body.paymentDueDate,
        paymentStatus: req.body.paymentStatus,
        customer: req.body.customer,
        items: []
    })

    newInvoice.save((error, document) => {
        if (error) {
            req.flash("errors",  "Oups, an error occured");
            return next()
        }
        req.flash("success", "Invoice created with success");
        res.redirect(req.get("referer"));
    })
}

export const update = (req: Request, res: Response, next: NextFunction) => {
    
    const invoice: iInvoice = {
        name: req.body.name,
        provider: req.body.provider,
        uiid: req.body.uiid,
        totalPaymentDue: req.body.total,
        paymentDueDate: req.body.paymentDueDate,
        paymentStatus: req.body.paymentStatus,
        customer: req.body.customer,
        items: []
    }

    Invoice.updateOne({id: req.body.id}, invoice, null, (error, document) => {
        if (error) {
            req.flash("errors",  "Oups, an error occured");
            return next()
        }
        req.flash("success", "Invoice created with success");
        res.redirect(req.get("referer"));
    })
}

export const remove = (req: Request, res: Response, next: NextFunction) => {

}

export const read = (req: Request, res: Response) => {

}