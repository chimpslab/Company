import Flash, { flash_duration } from "./core/Flash"
import jQuery from "jquery"
export const version = "1.0.0";
export const app = {
    
    jQuery: jQuery.fn.extend({
        flash_duration: flash_duration,
    })
}

export const core = {
    Flash,
    jQuery
}
export default app;