import Mustache from "mustache";
import _ from "lodash";

export function flash_duration(this: JQuery, duration = 4500) {
    this.delay(duration).hide(this.remove.bind(this));
    return this;
}

export type IFlashMessage = string|Array<string>|{msg: string}|Array<{msg: string}>;
export function Flash(type: string | any, message?: IFlashMessage): void {
    let messages: any = {};
    if (typeof type == "string") {
        messages = {};
        if ( _.isArray(message) ) {
            if (message.length == 0) {
                // console.warn("Call flash with empty array");
                return;
            }
            if (_.isString(message[0])) {
                messages[type] = _.map(message, (e: string) => {return {msg: e}; });
            }
            else {
                messages[type] = message;
            }
        } else if ( _.isObject(message) ) {
            messages[type] = [message];
        }
        else if (_.isString(message)) {
            messages[type] = [{msg: message}];
        }
    }
    else if ( _.isObject(type) ) {
        messages = type;
    }
    if (messages.errors) {
        const errtemplate = $("#flash_error").html();
        const $node = $(Mustache.render(errtemplate, messages));
        $(".flash").prepend($node.flash_duration(20000));
    }
    if (messages.warnings) {
        const errtemplate = $("#flash_warning").html();
        const $node = $(Mustache.render(errtemplate, messages));
        $(".flash").prepend($node.flash_duration(10000));
    }
    if (messages.success) {
        const errtemplate = $("#flash_success").html();
        const $node = $(Mustache.render(errtemplate, messages));
        $(".flash").prepend($node.flash_duration());
    }
    if (messages.info) {
        const errtemplate = $("#flash_info").html();
        const $node = $(Mustache.render(errtemplate, messages));
        $(".flash").prepend($node.flash_duration());
    }
    $(".alert.fade:not(.show)").addClass("show");
}

declare global {
    interface JQuery {
        flash_duration: ((
            duration?: number,
        ) => JQuery);

        data(key: "FormDismissal"): typeof flash_duration | undefined;
    }
}

export default Flash;