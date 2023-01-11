import _ from "lodash";
import "bootstrap";
import Mustache from "mustache";
import Flash from "../core/flash";

export const InputSelectOrganization = function (options: any) {
  // let organizations: Array<any> = [];
  const tmpl_org = `<button class="list-group-item list-group-item-action p2 {{active}}" id="{{id}}" data-organization="{{name}}"> {{name}} </button>`;
  const tmpl_tip = `<div class="mh-200 miw-200 list-group list-group-flush">{{#organizations}}{{ > item}}{{/organizations}}</div>`;
  const fill = (element: HTMLInputElement, organizations: Array<any>) => {
    if (element.value) {
      const t = _.find(organizations, {
        "name": element.value
      });
      if (t) t.active = "active";
    }
    $(element).popover({
      html: true,
      trigger: "focus",
      content: () => {
        const tip = $(Mustache.render(tmpl_tip, { organizations: organizations }, { item: tmpl_org }));
        tip.find("[data-organization]").click(e => {
          this.popover("dispose");
        });
        return tip[0];
      }
    }).on("shown.bs.popover", (e) => {
      const tip = $(e.target).data("bs.popover").tip;
      const focus = $(tip).find(".active")[0];
      if (focus) {
        $(tip).find(".list-group").scrollTop(focus.offsetTop - (focus.clientHeight * 2));
      }
    });
    $(element).popover("show");
  };

  this.click((e: any) => {
    $.get("/json/organization", (tz) => {
      console.log(tz);
      fill(e.target, tz.items);
    });
  });
};

export class PTOrganizationPanel extends HTMLElement {

  static get Tag() { return "app-organization"; }

  connectedCallback() {
    const tmpl_form = $("#tmpl-form").html();
    const tmpl_addressline = $("#tmpl-addressline").html();
    const tmpl_table = $("#tmpl-table").html();
    const tmpl_row = $("#tmpl-row").html();
    const tmpl_row_popover = $("#tmpl-row-popover").html();
    const tmpl_table_nav = $("#tmpl-table-nav").html();

    const $btn_new = $("#new");
    const $modal = $("#organization-modal.modal");
    const $modaltabs = $("#modal-tabs");
    const $table_body = $("#organization");
    const $table_nav = $("#organization-nav");
    const $page = $("#search [name='page']");
    const $limit = $("#search [name='limit']");

    $modal.on("show.bs.modal", () => {
      $table_body.find("[data-toggle='popover']").popover("hide");
    });

    const $tab_add = $modaltabs.find('[aria-controls="add-organization-collapse"]');
    const $tab_edit = $modaltabs.find('[aria-controls="edit-organization-collapse"]');
    const $tab_remove = $modaltabs.find('[aria-controls="delete-organization-collapse"]');

    const $collapse_add = $modal.find("#add-organization-collapse");
    const $collapse_edit = $modal.find("#edit-organization-collapse");
    const $collapse_remove = $modal.find("#delete-organization-collapse");

    $tab_add.on("show.bs.tab", () => {
      const $form = OrganizationForm({ action: "/organization/create", r: "create" })
      $form.on("changed.organization", () => refresh());
      $collapse_add.append($form);
    });
    $btn_new.on("click", () => {
      $tab_add.tab("show");
      $tab_add.trigger("show.bs.tab");
    });

    function refresh(callback?: Function) {
      $.get("/organization/read", data => {
        $table_body.empty().append(
          OrganizationTable(data)
        );
        if(_.isFunction(callback)){
          callback(data);
        }
      })
    }
    function OrganizationForm(data: any) {

      if (_.isObject(data.billing)) {
        console.log(data.billing);
        if (!_.isArray(data.billing.addressLine)) {
          data.billing.addressLine = ["", ""];
        }
        if (data.billing.addressLine.length == 0) {
          data.billing.addressLine = ["", ""];
        }
      } else {
        data.billing = {
          addressLine: ["", ""]
        };
      }

      const $container = $(Mustache.render(tmpl_form, { ...data }, { addressline: tmpl_addressline }));
      const $form = $container.find("form");

      $form.find("[name=billing_address]:first").prop("required", true);

      //   $form.find("[name=timezone]").select_timezone({});

      $form.on("submit", (e) => {
        e.preventDefault();
        const data = $form.serialize();
        // - console.log({action, data});
        $.post($form[0].action, data, (response) => {
          if (response) Flash(response);
          $modal.modal("hide");
          $form.trigger("changed.organization", response);
        }).fail(function (response) {
          if (response && response.responseJSON) Flash(response.responseJSON);
        });
      });

      return $container;
    }

    function OrganizationTable(datas: any) {
      function OrganizationDelete(data: any) {

        const template = $("#tmpl-form-delete").html();
        const $container = $(Mustache.render(template, { ...data }, { addressline: tmpl_addressline }));
        $tab_remove.removeClass("disabled");

        $tab_remove.tab("show");
        $modal.modal("show");

        return $container;
      }
      function OrganizationEdit(data: any, $item: JQuery) {
        $item.find(".edit").on("click", (e) => {
          e.preventDefault();
          $tab_edit.removeClass("disabled");
          $tab_edit.tab("show");
          $collapse_edit.empty().append(
            OrganizationForm({ ...data, r: "edit", action: "/organization/update" })
              .on("changed.organization", () => refresh())
          )
          $modal.modal("show");
          $tab_edit.on("hidden.bs.tab", function () {
            $tab_edit.addClass("disabled");
          });
        });
        $item.find(".delete").click(e => {
          e.preventDefault();
          $collapse_remove.empty().append(
            OrganizationDelete(data)
          )
        });
      }
      function OrganizationDetails(data: any, $item: JQuery) {
        $item.find(".details").popover({
          content: () => {
            const tip = $(Mustache.render(tmpl_row_popover, data));
            return tip[0];
          }
        }).on("shown.bs.popover", (e) => {

        });
      }
      function OrganizationItem(item: any, i?: number, map?: any) {
        const $orga = $(Mustache.render(tmpl_row, item));
        OrganizationEdit(item, $orga);
        OrganizationDetails(item, $orga);
        return $orga;
      }

      const rowData = _.map(datas.items, (item: any, i) => {
        return OrganizationItem({
          ...item,
          index: (Number(datas.page * datas.limit) + i + 1)
        });
      });
      const $table = $(Mustache.render(tmpl_table, {}));
      $table.find("tbody").html("").append(rowData);
      return $table;
    }

    refresh();

  }
}