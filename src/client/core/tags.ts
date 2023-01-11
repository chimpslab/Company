import _ from "lodash";
import Mustache from "mustache";

export class PTTagInput extends HTMLElement {
    o: { delimiter: string; };
    tmpl_tag_list: string;
    input: HTMLInputElement;
    output: HTMLInputElement;
    tooltip: HTMLElement;

    connectedCallback() {
        this.o = {delimiter: ","};
        this.tmpl_tag_list = "#tmpl_ulist";
        this.input = this.querySelector<HTMLInputElement>("#tagsin");
        this.output = this.querySelector<HTMLInputElement>("#tagsout");
        this.tooltip = this.querySelector<HTMLElement>('[data-tooltip]');
        this.addEventListener("change", () => this.update());

        this.update();
    }
    update(){
        const val = this.output.value + this.o.delimiter +  this.input.value;
        const words = _.chain(val.split(this.o.delimiter))
            .map(x => x.trim())
            .uniq()
            .compact()
            .value();
        this.output.value = words.join(this.o.delimiter);
        const $new_list = $(Mustache.render(
            $(this.tmpl_tag_list).html(), 
            {
                tags: words,
            }
        ));
        $(this).find(".tags-list").remove();
        $(this).append($new_list);
        $(this).trigger("tags_changed");

        const t = this.querySelectorAll<HTMLElement>("[data-bs-dismiss]");
        _.forEach(t, tagbtn => {
            tagbtn.addEventListener("click", l => {
                l.stopPropagation();
                this.removetag(tagbtn.dataset.value);
            });
        });

        this.input.value = "";
        this.tooltip.classList.toggle("collapse", t.length > 0);
    }

    removetag(term: string) {
        const val = this.output.value;
        const words = _.uniq(val.split(this.o.delimiter).map(x => x.trim()));
        this.output.value = _.chain(words)
            .filter(k => k != term)
            .join(this.o.delimiter)
            .value();
        this.update();
    }
};
