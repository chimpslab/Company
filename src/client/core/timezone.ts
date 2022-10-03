import _ from "lodash";
import Mustache from "mustache";

interface iTimezone {
    value: string;
    abbr: string;
    offset: number;
    isdst: boolean;
    text: string;
    utc: string[];
    active: string;
}
export function select_timezone(this: JQuery, options: any) {
    let timezones: iTimezone[] = [];
    const element = this[0];
    let tmpl_tz = `<button class="list-group-item list-group-item-action p2 {{active}}" id="{{id}}" data-tz="{{text}}"> {{text}} </button>`;
    let tmpl_tip = `<div class="mh-200 miw-200 list-group list-group-flush">{{#timezones}}{{ > item}}{{/timezones}}</div>`;
    let fill = (element: HTMLInputElement) => {
        //- console.log(element.value)
        if (element.value) {
            let t = _.find(timezones, {
                "text": element.value
            });
            if (t) t.active = "active";
        }
        //console.table(timezones)
        $(element).popover({
            html: true,
            content: () => {
                const tip = $(Mustache.render(tmpl_tip, {
                    timezones: timezones
                }, {
                    item: tmpl_tz
                }));
                tip.find('[data-tz]').click(e => {
                    this.val(e.target.dataset.tz);
                    this.popover("dispose");
                });
                return tip;
            }
        }).on("shown.bs.popover", (e) => {
            const tip = $(e.target).data("bs.popover").tip;
            const focus = $(tip).find(".active")[0];
            if (focus)
                $(tip).find(".list-group").scrollTop(focus.offsetTop - (focus.clientHeight * 2))
        });
        this.popover("show");
    }

    this.on("click", () => {
        $.get("/system/timezone", (tz) => {
            timezones = tz;
            fill(element as HTMLInputElement);
        })
    })
}

declare global {
    interface JQuery {
        select_timezone: ((
            options?: string | any
        ) => JQuery);
    }
}