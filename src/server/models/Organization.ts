import mongoose from "mongoose";

export type OrganizationDocument = mongoose.Document & {
    name: string,
    short: string,
    logoLarge: string,
    logoSmall: string,
    banner: string,

    contact: {
        person: string,
        phone: string,
        email: string,
        note: string,
    }

    billing: any,
    // billing: PaymentAddress,
    // postal: PaymentAddress,
    // sameHasBilling: boolean,

    timezone: string,

    comment: string,
};

export interface IOrganization extends mongoose.Model<OrganizationDocument> {
    searchPartial: (term: string, callback: mongoose.Callback) => void;
}

const OrganizationDocumentShema = new mongoose.Schema({
    name: {type: String, required: true},
    short: {type: String, required: true},
    logoLarge: {type: String},
    logoSmall: {type: String},
    banner: {type: String},

    contact: {
        person: {type: String},
        phone: {type: String},
        email: {type: String},
        note: {type: String},
    },

    billing: Object,
    // postalAddress: Object,
    // sameHasBilling: Boolean,

    timezone: String,


    comment: {type: String},
});

export interface OrganizationSearchOption {
    id: string
    query: string;
    page: number;
    sortorder: -1|1;

    sortfield: string;
    limit: number;
    count: boolean;
}

OrganizationDocumentShema.static("searchPartial", function(query: string, callback: mongoose.Callback) {
    return this.find({
        $or: [
            { "name": new RegExp(query, "gi") },
            { "short": new RegExp(query, "gi") }
        ]
    }, callback);
});
export const Organization = mongoose.model<OrganizationDocument, IOrganization>("Organization", OrganizationDocumentShema);