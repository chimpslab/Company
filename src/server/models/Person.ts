// 2019 BrightNightGames. All Rights Reserved

import mongoose, { Model, Document, Query } from "mongoose";
import _ from "lodash";
import { ThingDocument, ThingSchema } from "./Thing";


export interface IPerson {
    email: string;
    phone: string[];
    firstname: string,
    lastname: string,
    picture: string
    tags: string[];
}

export type PersonDocument = IPerson & ThingDocument & {

}

interface IPersonModel extends mongoose.Model<PersonDocument> {
    searchPartial(model: mongoose.Model<PersonDocument>, options: IPersonSearchOption, callback: mongoose.Callback<PersonDocument>): void;
    searchTags(model: mongoose.Model<PersonDocument>, options: IPersonSearchOption, callback: mongoose.Callback<PersonDocument>): void;
    MostUsedTags(callback: mongoose.Callback<string[]>): void;
}

const PersonSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true, lowercase: true },
    phone: {type: [String]},
    firstname: {type: String, required: true},
    lastname: {type: String},
    picture: String,
    tags: {type: [String]}

}, { timestamps: true });

PersonSchema.add(ThingSchema);

PersonSchema.virtual("fullname").get(function () {
    return this.firstname + " " + this.lastname;
});
PersonSchema.index({
    "email": 1,
    "firstname": "text",
    "lastname": "text"
});

export interface IPersonSearchOption {
    id: string
    query: string;
    page: number;
    sortorder: -1|1;

    sortfield: string;
    limit: number;
    count: boolean;

    __t?: string;
}
PersonSchema.static("searchPartial", function(model: PersonDocument, options: IPersonSearchOption, callback: mongoose.Callback<PersonDocument>) {
    const reg = new RegExp(options.query, "gi");
    const search: any = {
        $or: [
            { "email": reg },
            { "firstname": reg },
            { "lastname": reg },
        ],
    };

    this.find(search)
        // .and(andClause)
        .skip( options.page * options.limit)
        .limit(options.limit)
        .sort({email: options.sortorder})
        .exec(callback);
    // return this.find(search);
});


PersonSchema.static("searchTags", function(model: IPerson, options: IPersonSearchOption, callback: mongoose.Callback<PersonDocument>) {
    const search: any = {
        $and: []
    };
    const tags = options.query.replace("tags:", "").split(",");

    if (tags.length) {
        const $or = _.map(tags, t => {
            return {"tags": t};
        });
        search.$and.push({$or});
    }

    this.find(search)
        .skip( options.page * options.limit)
        .limit(options.limit)
        .sort({email: options.sortorder})
        .exec(callback);
});

PersonSchema.static("MostUsedTags", function(callback: mongoose.Callback<string[]>) {
    Person.find((err, res) => {
        const resultTags = _.chain(res)
            .map(p => p.tags)
            .flatten()
            .uniq()
            .value();
        callback(undefined, resultTags);
    });
});


export const Person = mongoose.model<IPerson, IPersonModel >("Person", PersonSchema);



export interface IPersonGroupInterface {
    members: String[];
}
export interface IPersonGroupDocument extends IPersonGroupInterface, mongoose.Document {

}

export interface IPersonGroupModel extends mongoose.Model<IPersonGroupDocument> {

}

const PersonGroupSchema = new mongoose.Schema({
    members: {type: [mongoose.Schema.Types.ObjectId], ref: "Person"},
});

export const PersonGroup = mongoose.model<IPersonGroupDocument, IPersonGroupModel>("PersonGroup", PersonGroupSchema);