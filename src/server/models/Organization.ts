import mongoose from "mongoose";
import { IPerson } from "./Person";
import { iThing, ThingDocument, ThingSchema } from "./Thing";

export interface iAddress {
    country: string;
    region: string;
    city: string;
    postalCode: string;
    streetAddress: [string];
}

export interface iBillingAddress extends iAddress{
}

export interface iOrganization extends iThing{
    legalName: string,
    telephone: string;
    mail?: string;
    contact?: string,
    billing: iBillingAddress,
    taxID: String,
    vatID: String,
    parentOrganization?: iOrganization,
    timezone: string,
    languageCode: string,
}

const OrganizationShema = new mongoose.Schema({
    legalName: {type: String},
    telephone: {type: String},
    mail: {type: String},
    contact: {type: mongoose.Schema.Types.ObjectId, ref: "Person"},
    address: {type: Object},
    billing: {type: Object},
    taxID: {type: String, require: true},
    vatID: {type: String, require: true},
    timezone: String,
    languageCode: String,
});
OrganizationShema.add(ThingSchema)

OrganizationShema.static("searchPartial", function(query: string, callback: mongoose.Callback) {
    return this.find({
        $or: [
            { "name": new RegExp(query, "gi") },
            { "short": new RegExp(query, "gi") }
        ]
    }, callback);
});
export type OrganizationDocument = iOrganization & ThingDocument & {};
export interface IOrganizationModel extends mongoose.Model<OrganizationDocument> {
    searchPartial: (term: string, callback: mongoose.Callback) => void;
}
export const Organization = mongoose.model<OrganizationDocument, IOrganizationModel>("Organization", OrganizationShema);