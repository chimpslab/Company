import { DateTime } from "luxon";
import mongoose, { mongo } from "mongoose";
import { iThing, ThingDocument, ThingSchema } from "./Thing";

export interface iItemQuantity {
    item: string;
    quantity: number;
}

export class ItemQuantity implements iItemQuantity{
    item: string;
    quantity: number;
}

export enum EPaymentStatus {
    PaymentAutomaticallyApplied = "Automatic",
    PaymentComplete = "Completed",
    PaymentDeclined = "Declined",
    PaymentDue = "Due",
    PaymentPastDue = "PastDue",
}

export interface iInvoice extends iThing {
    provider: string,
    customer: string,
    uiid: string, // unique invoice id
    items: ItemQuantity[],
    totalPaymentDue: number,
    paymentDueDate: Date,
    paymentStatus: EPaymentStatus
}

const InvoiceSchema = new mongoose.Schema({
    provider: {type: mongoose.Schema.Types.ObjectId, ref: "Organization", require: true},
    customer: {type: mongoose.Schema.Types.ObjectId, ref: "Organization", require: true},
    items: {type: [Object], require: true},
    vatrate: {type: Number},
    totalPaymentDue: {type: Number, require: true},
    paymentDueDate: {type: Date, default: DateTime.now().plus({days: 10}).toJSDate()},
    paymentStatus: {type: Object.values(EPaymentStatus), default: EPaymentStatus.PaymentDue}
}, {timestamps: true});
InvoiceSchema.add(ThingSchema)

export type InvoiceDocument = iInvoice & ThingDocument & {}

export const Invoice = mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);
