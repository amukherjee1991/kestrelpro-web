/* KestrelPro: history of every block and unblock.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

let table;

function query() {
  const params = new URLSearchParams({
    what: $("#kp-what").val(),
    days: $("#kp-days").val(),
  });
  if ($("#kp-network").val()) params.set("network", $("#kp-network").val());
  return params.toString();
}

function undoButton(row) {
  const d = utils.escapeHtml(row.domain);
  if (row.current_status === "blocked" || row.current_status === "user_blocked") {
    return `<button type="button" class="btn btn-default btn-xs" data-act="unblock" data-domain="${d}"><i class="fa fa-rotate-left"></i> Unblock</button>`;
  }

  if (row.current_status === "pending") {
    return `<button type="button" class="btn btn-danger btn-xs" data-act="approve" data-domain="${d}"><i class="fa fa-ban"></i> Block</button>`;
  }

  return "";
}

$(() => {
  // "Home network / VPN" only means something when VPN address ranges are configured.
  kestrel
    .api("/settings")
    .then(s => {
      if (!s.vpn_subnets || s.vpn_subnets.length === 0) $("#kp-network").closest(".form-group").addClass("hidden");
    })
    .catch(() => {});
  const preset = utils.parseQueryString().what;
  if (preset && $(`#kp-what option[value="${CSS.escape(preset)}"]`).length > 0) $("#kp-what").val(preset);

  table = $("#kp-history").DataTable({
    ajax(_data, callback) {
      kestrel
        .api("/history?" + query())
        .then(r => {
          $("#kp-sum-blocked").text(r.summary.blocked.toLocaleString());
          $("#kp-sum-auto").text(r.summary.auto_blocked.toLocaleString());
          $("#kp-sum-undone").text(r.summary.undone.toLocaleString());
          callback({ data: r.events });
        })
        .catch(() => callback({ data: [] }));
    },
    columns: [
      { title: "When", data: "at", className: "kp-when", render: utils.renderTimespan },
      { title: "What happened", data: "action", render: (a, type) => (type === "display" ? kestrel.actionLabel(a) : a) },
      { title: "Domain", data: "domain", className: "kp-domain", render: $.fn.dataTable.render.text() },
      {
        title: "Verdict",
        data: "category",
        render: (c, type, row) =>
          type === "display"
            ? `${kestrel.categoryLabel(c)} <span class="text-muted kp-conf">${kestrel.percent(row.confidence)}</span>`
            : c,
      },
      { title: "Reason", data: "reason", className: "kp-reason", render: $.fn.dataTable.render.text() },
      {
        title: "Devices",
        data: "clients",
        orderable: false,
        render: (c, type) => (type === "display" ? kestrel.devices(c) : (c || []).map(x => x.name || x.ip).join(" ")),
      },
      { title: "", data: null, orderable: false, className: "kp-actions", render: (_d, _t, row) => undoButton(row) },
    ],
    order: [[0, "desc"]],
    autoWidth: false,
    language: { emptyTable: "Nothing happened in this period." },
  });

  $("#kp-filters select").on("change", () => table.ajax.reload());
  $("#kp-history").on("click", "button[data-act]", async function () {
    const btn = $(this);
    btn.prop("disabled", true);
    try {
      await kestrel.decide(btn.data("domain"), btn.data("act"));
    } finally {
      table.ajax.reload(null, false);
    }
  });
  kestrel.refreshStatus().catch(() => {});
});
