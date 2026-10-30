/* KestrelPro: "Needs approval" and "Decisions" tables.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const tableEl = $("#kp-table");
const review = tableEl.data("mode") === "review";
const STATUSES = new Set(["flagged", "blocked", "allowed", "all"]);
let status = "pending";
if (!review) {
  const wanted = utils.parseQueryString().status;
  status = STATUSES.has(wanted) ? wanted : "flagged";
}

let table;

function buttons(row) {
  const d = utils.escapeHtml(row.domain);
  const btn = (action, cls, icon, text) =>
    `<button type="button" class="btn btn-${cls} btn-xs" data-act="${action}" data-domain="${d}"><i class="fa fa-${icon}"></i> ${text}</button>`;
  if (row.status === "pending") {
    return btn("approve", "danger", "ban", "Block") + btn("reject", "default", "check", "Don't block");
  }

  if (row.status === "blocked" || row.status === "user_blocked") {
    return btn("unblock", "default", "rotate-left", "Unblock");
  }

  return btn("block", "danger", "ban", "Block");
}

function columns() {
  const cols = [
    { title: "Domain", data: "domain", className: "kp-domain", render: $.fn.dataTable.render.text() },
    { title: "Category", data: "category", render: (c, type) => (type === "display" ? kestrel.categoryLabel(c) : c) },
    {
      title: "Confidence",
      data: "confidence",
      render: (c, type) => (type === "display" ? kestrel.percent(c) : c),
    },
  ];
  // Decisions has a Status column too; fold confidence into the category cell to keep it in its card.
  if (!review) {
    cols.splice(1, 2, {
      title: "Verdict",
      data: "category",
      render: (c, type, row) =>
        type === "display"
          ? `${kestrel.categoryLabel(c)} <span class="text-muted kp-conf">${kestrel.percent(row.confidence)}</span>`
          : c,
    });
  }

  cols.push(
    { title: "Reason", data: "reason", className: "kp-reason", render: $.fn.dataTable.render.text() },
    {
      title: "Devices",
      data: "clients",
      orderable: false,
      render: (c, type) => (type === "display" ? kestrel.devices(c) : (c || []).map(x => x.name || x.ip).join(" ")),
    }
  );
  if (!review) {
    cols.push({
      title: "Status",
      data: "status",
      render: (s, type, row) => (type === "display" ? kestrel.statusLabel(s, row) : s),
    });
  }

  cols.push(
    { title: review ? "Judged" : "Updated", data: review ? "judged_at" : "updated_at", render: utils.renderTimespan },
    { title: "", data: null, orderable: false, className: "kp-actions", render: (_d, _t, row) => buttons(row) }
  );
  return cols;
}

function emptyText() {
  if (review) return "Nothing waiting for your approval.";
  return {
    flagged: "Nothing flagged yet. KestrelPro is keeping watch.",
    blocked: "KestrelPro hasn't blocked anything.",
    allowed: "No allowed domains yet.",
  }[status] || "No domains here yet.";
}

function reload() {
  table.ajax.reload(null, false);
  kestrel.refreshStatus().catch(() => {});
}

$(() => {
  $(`#kp-tabs li[data-status="${status}"]`).addClass("active");
  const timeIndex = columns().length - 2;
  table = tableEl.DataTable({
    ajax(_data, callback) {
      kestrel
        .api(`/decisions?status=${status}&limit=1000`)
        .then(rows => {
          $("#kp-approve-all").prop("disabled", rows.length === 0);
          callback({ data: rows });
        })
        .catch(() => callback({ data: [] }));
    },
    columns: columns(),
    order: [[timeIndex, "desc"]],
    autoWidth: false,
    lengthMenu: [
      [25, 50, 100, -1],
      [25, 50, 100, "All"],
    ],
    language: { emptyTable: emptyText() },
    stateSave: true,
    stateSaveCallback(settings, data) {
      utils.stateSaveCallback("kestrel_" + (review ? "review" : "decisions"), data);
    },
    stateLoadCallback() {
      return utils.stateLoadCallback("kestrel_" + (review ? "review" : "decisions"));
    },
  });

  tableEl.on("click", "button[data-act]", async function () {
    const btn = $(this);
    btn.prop("disabled", true);
    try {
      await kestrel.decide(btn.data("domain"), btn.data("act"));
    } finally {
      reload();
    }
  });

  $("#kp-approve-all").on("click", async () => {
    const n = table.rows().count();
    if (!confirm(`Block all ${n} suggested domain(s)?`)) return;
    const r = await kestrel.api("/pending/approve-all", { method: "POST" });
    utils.showAlert("success", "fas fa-check", "Blocked", `${r.approved} domain(s)`);
    reload();
  });

  $("#kp-block-form").on("submit", async event => {
    event.preventDefault();
    const domain = $("#kp-block-domain").val().trim().toLowerCase().replace(/\.$/, "");
    if (!utils.validateHostname(domain) || !domain.includes(".")) {
      utils.showAlert("warning", "", "Not a domain", domain);
      return;
    }

    await kestrel.decide(domain, "block");
    $("#kp-block-domain").val("");
    reload();
  });

  kestrel.refreshStatus().catch(() => {});
  utils.setInter(reload, 30000);
});
