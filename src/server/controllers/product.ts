import { NextFunction, Request, Response } from "express";

export const manage = (req: Request, res: Response) => {
    res.render("manage/product", {
        title: "Product", 
    })
}

export const create = async (req: Request, res: Response, next: NextFunction) => {

    res.sendStatus(200)
}

export const update = async (req: Request, res: Response, next: NextFunction) => {
    res.sendStatus(200)
}

export const remove = async (req: Request, res: Response, next: NextFunction) => {
    res.sendStatus(200)
}

export const read = async (req: Request, res: Response, next: NextFunction) => {

    res.sendStatus(200)
}