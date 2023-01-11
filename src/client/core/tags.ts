import _ from "lodash";
import Mustache from "mustache";

export class PTTagInput extends HTMLElement {
    o: { delimiter: string; };
    tmpl_tag: string;
    tmpl_tag_list: string;
    input: HTMLInputElement;

    connectedCallback() {
        const options = {};
        this.o = {delimiter: ","};
        this.tmpl_tag_list = "#tmpl_ulist";
        this.tmpl_tag = "#tmpl_tags";
        this.input = this.querySelector<HTMLInputElement>("input");
    
        if (!$.isPlainObject(options)) {
            this.o = Object.assign({delimiter: ","}, options || {});
        }
        this.addEventListener("change", () => this.update());

        this.update();
    }
    destroy() {
    }
    update(){
        const val = this.input.value;
        const words = _.chain(val.split(this.o.delimiter))
            .map(x => x.trim())
            .uniq()
            .compact()
            .value();
        this.input.value = words.join(this.o.delimiter);
        const $new_list = $(Mustache.render(
            $(this.tmpl_tag_list).html(), {
                tags: words,
            }, {
                tag: $(this.tmpl_tag).html(),
            })
        );
        $(this).next(".tags-list").remove();
        $(this).after($new_list);
        $(this).trigger("tags_changed");
        $new_list.find("[data-action]").toArray().forEach(tagbtn => {
            tagbtn.addEventListener("click", l => {
                l.preventDefault();
                this.removetag(tagbtn.dataset.value);
            });
        });
    }

    removetag(term: string) {
        const val = this.input.value;
        const words = _.uniq(val.split(this.o.delimiter).map(x => x.trim()));
        this.input.value = _.chain(words)
            .filter(k => k != term)
            .join(this.o.delimiter)
            .value();
        this.update();
    }
};
