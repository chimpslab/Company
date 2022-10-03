// 2019 BrightNightGames. All Rights Reserved
import crypto from "crypto";
import mongoose, { Callback } from "mongoose";
import { ERoles } from "./Role";
import _ from "lodash";
import logger from "../util/logger";

import { palette } from "../util/colors";
import { DateTime } from "luxon";


export interface IAgreement {
    title: string;
    status: "Accepted" | "Declined";
    date: Date;
}

export enum EAccountHistoryEventType {
    HISTORY_ACCOUNT_CREATE,
    HISTORY_ACCOUNT_UPDATE,
    HISTORY_CONSENT_CHANGED,
    HISTORY_ACCOUNT_2FA_REQUESTED,
}
interface IAccountHistory {
    type: EAccountHistoryEventType;
    date: Date;

    note: string;
}


export type UserDocument = mongoose.Document & {
    email: string,

    role: ERoles,
    roleProfile: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" }

    facebook: string,
    rtctoken: string;
    tokens: AuthToken[],
    devices: mongoose.Types.ObjectId[],

    profile: {
        name: string,
        gender: string,
        location: string,
        website: string,
        picture: string
    },

    agreements: IAgreement[];
    history: IAccountHistory[];

    gravatar: (size: number) => string,

};

export interface IUser extends mongoose.Model<UserDocument> {

    issueToken(user: string, kind: string, duration?: number, size?: number, unique?: boolean, userdata?: any): Promise<{ user: UserDocument, token: AuthToken }>;

    withToken(token: string): Promise<{ user: UserDocument, token: AuthToken }>;
    withCookie(db: mongoose.Connection, cookies: string): Promise<UserDocument>;
}

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;


export type AuthToken = {
    accessToken: string,
    kind: string,
    expire: Date,
    userdata?: any,
};

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    role: { type: String, enum: Object.values(ERoles), default: ERoles.reader },
    roleProfile: { type: String },

    organization: { type: String },

    facebook: String,
    twitter: String,
    google: String,
    tokens: Array,
    rtctoken: String,
    devices: [{ type: mongoose.Types.ObjectId, ref: "LinkedDevice" }],

    profile: {
        name: String,
        gender: String,
        location: String,
        website: String,
        picture: String
    },

    agreements: { type: [Object] },
    history: { type: [Object] }
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.mii = function (this: UserDocument, size = 200) {
    const label = _.get(this, "profile.value",
        _.get(this, "email",
            "undefined name"));
    let initials = label
        .match(/[\w]+/g)
        .map((x: string) => x[0].toUpperCase())
        .join("")
        .substring(0, 2);

    const color = palette[initials.charCodeAt(0) % palette.length];

    return `data:image/svg+xml;utf8,
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50%" cy="50%" r="${size * 0.7}" fill="${color}"/>
    <text x="50%" y="50%" dominant-baseline="middle" font-family="Verdana" text-anchor="middle" font-size="${size * 0.6}" fill="white">${initials}</text>
  </svg>`;
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function (this: UserDocument, size: number) {
    if (!size) {
        size = 200;
    }
    if (!this.email) {
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash("md5").update(this.email).digest("hex");
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};


userSchema.methods.consumeToken = function (this: UserDocument, token: string, next: Callback<UserDocument>) {
    const now = new Date();
    this.tokens = this.tokens.filter((k: AuthToken) => {
        return k.expire < now || k.accessToken == token;
    });

    this.save(next);
};

userSchema.static("issueToken", function (userId: string, kind: string, duration = 1440, size = 21, unique = true, userdata: any = undefined) {

    return new Promise(async (resolve, reject) => {
        const user = await User.findOne({ email: userId });

        if (!user) return reject(new Error("User Not Found"));

        const token: AuthToken = {
            accessToken: crypto.randomBytes(size).toString("hex"),
            kind: kind,
            expire: duration > 0 
                ? DateTime.now().plus({minutes: duration}).toJSDate() 
                : DateTime.now().plus({years: 50}).toJSDate() // 1D
        };

        if (userdata) {
            token.userdata = userdata;
        }

        if (unique) {
            user.tokens = user.tokens.filter((k: AuthToken) => {
                if (k.kind != kind) return true;
                if (k.userdata && userdata && userdata.salt
                    && k.userdata.salt == userdata.salt) return false;
                return true;
            });
        }

        user.tokens.push(token);

        // GDPR Section
        logger.info(`User request Token`, token);
        switch (kind) {
            case "2FA":
                user.history.push({ type: EAccountHistoryEventType.HISTORY_ACCOUNT_2FA_REQUESTED, date: new Date(), note: "User request 2FA" });
                break;
        }
        // End GDPR

        user.save((err, u) => {
            if (err) return reject(err);
            resolve({
                user: user,
                token: token
            });
        });
    });
});
userSchema.static("withToken", function (token: string): Promise<{ user: UserDocument, token: AuthToken }> {

    return new Promise(async (resolve, reject) => {
        _.forEach(await User.find(), user => {
            const ctoken = _.find(user.tokens, t => { return t.accessToken == token; });
            // console.log( "CTOKEN", ctoken, token);
            if (ctoken) {
                resolve({ user, token: ctoken });
                return true;
            }
        });

        reject();
    });
});

export const GetCookieValue = (cookie: string, name: string) => (
    cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)")?.pop() || ""
);

userSchema.static("withCookie", function (db: mongoose.Connection, cookies: string): Promise<UserDocument> {
    return new Promise(async (res, rej) => {

        const DeviceSession = GetCookieValue(cookies, "BNG_DEVICE_SESSION");
        if (DeviceSession) {
            const SessionId = DeviceSession.substring(4, 36);
            // const Unsigned = cookieParser.signedCookie(DeviceSession, SESSION_SECRET);
            const SessionDocument = await db.collection("sessions").findOne({ _id: SessionId });
            if (SessionDocument && SessionDocument.session) {
                const Session = JSON.parse(SessionDocument.session);
                if (Session.passport && Session.passport.user) {
                    const SocketUser = await User.findById(Session.passport.user).exec();
                    if (SocketUser) {
                        // console.log("User FOUND with cookie :", {SessionId}, SocketUser);
                        return res(SocketUser);
                    }
                }
            }
        }
        res(undefined);
    });
});


userSchema.methods.checkToken = function (this: UserDocument, token: string): boolean {
    return true;
    const t = this.tokens.filter((k: AuthToken) => k.accessToken == token);
    if (t.length) {
        const now = new Date();
        return now < t[0].expire;
    }
    return false;
};

export const User = mongoose.model<UserDocument, IUser>("User", userSchema);
