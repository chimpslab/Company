import * as http from "http";
import errorHandler from "errorhandler";
import _ from "lodash";
import mongoose from "mongoose";
import async, { AsyncResultCallback } from "async";
import { exec } from "child_process";
import { ERoles } from "./models/Role";
import { User, UserDocument } from "./models/User";

import app from "./app";
import logger from "./util/logger";
export type VoidCallback = AsyncResultCallback<void> ;
/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

// export const httpServer = http.createServer(app);
export const httpServer = http.createServer(app);

import { MONGODB_URI } from "./util/secrets";
mongoose.connect(MONGODB_URI);

const db = mongoose.connection;

async.waterfall([
  (next: VoidCallback) => {
    logger.debug("[Start] Initialize Database");
    db.once("open", () => next(undefined));
  },
  (next: VoidCallback) => {
    logger.debug("[Start] Check Root user validity");
    User.findOne({ email: process.env.SUPERADMIN_EMAIL }, (err: any, user: UserDocument) => {
      if (!user) {
        console.log("  Create SUPERADMIN User with email " + process.env.SUPERADMIN_EMAIL);
        const root = new User({
          email: process.env.SUPERADMIN_EMAIL,
          password: process.env.SUPERADMIN_SECRET,
          role: ERoles.superadmin
        });
        root.save().then(() => next(undefined));
      } else {
        if (user.role != "superadmin") {
          user.role = ERoles.superadmin;
          user.save().then(() => next(undefined));
          console.log(`  Promote ${process.env.SUPERADMIN_EMAIL} as SUPERADMIN`);
        }
        else {
          next(undefined);
        }
      }
    });
  },
  (next: VoidCallback) => {
    logger.debug("[Start] Start Http services");

    startHttpService();
    next(undefined);
  },
  (next: VoidCallback) => {
    exec(`echo ${process.pid} > /tmp/schoolboard.pid`, (err, stdout, stderr) => {
      logger.debug(`[Start] Echoed pid [${process.pid}] to /tmp/schoolboard.pid`);


      function handle(signal: string) {
        logger.info(`Received ${signal}`);

        if (httpServer) {
          httpServer.close();
        }
        // if (httpServer) {
        //   httpServer.close();
        // }
        exec(`rm /tmp/schoolboard.pid`);
      }

      process.on("SIGINT", handle);
      process.on("SIGTERM", handle);
      logger.info("Press CTRL-C to stop\n");
      next(undefined);
    });
  }
], (err) => {
  if(err && err.message) {
    logger.error(err.message);
  }
});


function startHttpService() {

  httpServer.listen(app.get("httpport"), () => {
    logger.info(`  App is running (secure) at https://localhost:${app.get("httpport")} in '${app.get("env")}' mode`);

    if (process.env.NODE_ENV != "production") {
      // console.table(app._router.stack);
      app._router.stack          // registered routes
        .filter((r: any) => r.route)    // take out all the middleware
        .map((r: any) => r.route.path);  // get all the paths
    }
  });

}

db.on("error", err => {
  logger.emerg("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

export const Server = {
  // httpServer,
  httpServer,
};
