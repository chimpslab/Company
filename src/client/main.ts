import Flash, { flash_duration } from "./core/flash"
import jQuery from "jquery"

import {PTOrganizationPanel} from "./app/organization"
import { select_timezone } from "./core/timezone";
import { PTInvoicePanel } from "./app/invoice";
import { PTProductPanel } from "./app/product";
import { PTTagInput } from "./core/tags";
import { PTImageInput } from "./core/image";

export const version = "1.0.0";
export const app = {
    
    jQuery: jQuery.fn.extend({
        flash_duration,
        select_timezone,
    })
}

export const core = {
    Flash,
    jQuery
}

export const widget = {
    PTOrganizationPanel,
    PTInvoicePanel,
    PTProductPanel,
    PTTagInput,
    PTImageInput,
}
export default app;