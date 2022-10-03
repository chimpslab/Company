import mongoose from "mongoose";

export interface iThing {
    name: string
    image: string,
    description: string,
    url: string,
}
export type ThingDocument = iThing & mongoose.Document & {
    name: string
    image: string,
    description: string,
    url: string,
}

export const ThingSchema = new mongoose.Schema({
    name: {type: String, require: true},
    image: String,
    description: String,
    url: String,
}, {timestamps: true});