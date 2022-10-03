import { Request, Response } from "express";

export const getInvoice = (req: Request, res: Response) => {
    res.render("invoice", {
        title: "Invoice"
    })
}

export const postInvoice = (req: Request, res: Response) => {

}

export const apiGetInvoice = (req: Request, res: Response) => {

}