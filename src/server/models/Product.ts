import mongoose from "mongoose";
import { ThingDocument, ThingSchema } from "./Thing";

export type ProductDocument = ThingDocument & {
    price: number,
    vatrate: number,
}

export const ProductSchema = new mongoose.Schema({
    price: {type: Number, require: true},
    vatrate: {type: Number},
}, {timestamps: true});
ProductSchema.add(ThingSchema)

export const Product = mongoose.model<ProductDocument>("Product", ProductSchema );
