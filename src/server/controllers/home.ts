// 2019 BrightNightGames. All Rights Reserved

import { Request, Response, NextFunction } from "express";
/**
 * GET /
 * Home page.
 */

export let index = async(req: Request, res: Response, next: NextFunction) => {
  res.render("home", {
    title: "Home",
  });
};
