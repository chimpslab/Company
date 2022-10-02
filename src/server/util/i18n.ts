// 2019 BrightNightGames. All Rights Reserved

import fs from "fs";
import _ from "lodash";
export interface I18nEntry {
    filename: string;
    linenum: Number;
    column: Number;
    word: string;
    namespace: string;
    context: string;
}
export interface I18nTranslation {
    locatedAt: string[];
    key: string;
    context: string;
    translation: string;
}
export class I18nEntries extends Array<I18nEntry> {

}
export class I18nTranslations extends Array<I18nTranslation> {

}
export let locale = {
    default: "en",
    language: "en",
    atlas: new I18nTranslations(),
    cache: process.env.NODE_ENV == "production"
};
export function setLocale(language: string) {
    locale.language = language;

    loadAtlas(locale.language);
}

function loadAtlas (language: string) {
    const json = JSON.parse(fs.readFileSync(`./languages/${language}.json`, "utf8"));
    const t = new I18nTranslations();
    _.forEach(json, (f: I18nTranslation, i) => {
        // console.log(f);
        t.push(f);
        // return f;
    });
    locale.atlas = t;

}

export let _x = function (x: string, context?: string, namespace?: string) {
    // console.log(locale);
    // console.log("i18n", {x, context, namespace});
    return x;
};
export let _xu = function (user: any, key: string, context?: string, namespace?: string) {
    // console.log("i18n", {key, context, namespace});

    if (!locale.cache) {
        loadAtlas(locale.language);
    }

    const ref = _.find(locale.atlas, (x) => x.context == context && x.key == key);
    if (ref && ref.translation) {
        // console.log(" translated to ", ref.translation);
        return ref.translation;
    }
    // console.log(" translation missing");

    return key;
};

