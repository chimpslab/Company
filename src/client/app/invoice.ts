import _ from "lodash";
import Mustache from "mustache";
import Flash from "../core/flash";



export class PTInvoicePanel extends HTMLElement {

    static get Tag() { return "app-invoice"; }
  
    connectedCallback() {
      const tmpl_form = $("#tmpl-form").html();
      const tmpl_addressline = $("#tmpl-addressline").html();
      const tmpl_table = $("#tmpl-table").html();
      const tmpl_row = $("#tmpl-row").html();
      const tmpl_row_popover = $("#tmpl-row-popover").html();
      const tmpl_table_nav = $("#tmpl-table-nav").html();
  
      const $btn_new = $("#new");
      const $modal = $("#invoice-modal.modal");
      const $modaltabs = $("#modal-tabs");
      const $table_body = $("#invoice");
      const $table_nav = $("#invoice-nav");
      const $page = $("#search [name='page']");
      const $limit = $("#search [name='limit']");
  
      $modal.on("show.bs.modal", () => {
        $table_body.find("[data-toggle='popover']").popover("hide");
      });
  
      const $tab_add = $modaltabs.find('[aria-controls="add-invoice-collapse"]');
      const $tab_edit = $modaltabs.find('[aria-controls="edit-invoice-collapse"]');
      const $tab_remove = $modaltabs.find('[aria-controls="delete-invoice-collapse"]');
  
      const $collapse_add = $modal.find("#add-invoice-collapse");
      const $collapse_edit = $modal.find("#edit-invoice-collapse");
      const $collapse_remove = $modal.find("#delete-invoice-collapse");
  
      $tab_add.on("show.bs.tab", () => {
        const $form = InvoiceForm({ action: "/invoice/create", r: "create" })
        $form.on("changed.invoice", () => refresh());
        $collapse_add.append($form);
      });
      $btn_new.on("click", () => {
        $tab_add.tab("show");
        $tab_add.trigger("show.bs.tab");
      });
  
      function refresh(callback?: Function) {
        $.get("/invoice/read", data => {
          $table_body.empty().append(
            InvoiceTable(data)
          );
          callback(data);
        })
      }
      function InvoiceForm(data: any) {
  
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
            $form.trigger("changed.invoice", response);
          }).fail(function (response) {
            if (response && response.responseJSON) Flash(response.responseJSON);
          });
        });
  
        return $container;
      }
  
      function InvoiceTable(datas: any) {
        function InvoiceDelete(data: any) {
  
          const template = $("#tmpl-form-delete").html();
          const $container = $(Mustache.render(template, { ...data }, { addressline: tmpl_addressline }));
          $tab_remove.removeClass("disabled");
  
          $tab_remove.tab("show");
          $modal.modal("show");
  
          return $container;
        }
        function InvoiceEdit(data: any, $item: JQuery) {
          $item.find(".edit").on("click", (e) => {
            e.preventDefault();
            $tab_edit.removeClass("disabled");
            $tab_edit.tab("show");
            $collapse_edit.empty().append(
              InvoiceForm({ ...data, r: "edit", action: "/invoice/update" })
                .on("changed.invoice", () => refresh())
            )
            $modal.modal("show");
            $tab_edit.on("hidden.bs.tab", function () {
              $tab_edit.addClass("disabled");
            });
          });
          $item.find(".delete").click(e => {
            e.preventDefault();
            $collapse_remove.empty().append(
              InvoiceDelete(data)
            )
          });
        }
        function InvoiceDetails(data: any, $item: JQuery) {
          $item.find(".details").popover({
            content: () => {
              const tip = $(Mustache.render(tmpl_row_popover, data));
              return tip[0];
            }
          }).on("shown.bs.popover", (e) => {
  
          });
        }
        function InvoiceItem(item: any, i?: number, map?: any) {
          const $orga = $(Mustache.render(tmpl_row, item));
          InvoiceEdit(item, $orga);
          InvoiceDetails(item, $orga);
          return $orga;
        }
  
        const rowData = _.map(datas.items, (item: any, i) => {
          return InvoiceItem({
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