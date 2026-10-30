/* KestrelPro: "something broke on this device".
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

function row(b) {
  const d = utils.escapeHtml(b.domain);
  const disabled = b.enabled === false ? ' <span class="label label-default">paused</span>' : "";
  return (
    `<tr><td class="kp-domain">${d}</td><td>${b.lookups}</td>` +
    `<td class="kp-when">${utils.datetime(b.last_seen, false, true)}</td>` +
    `<td>${b.category ? kestrel.categoryLabel(b.category) : ""}</td>` +
    `<td class="kp-reason">${utils.escapeHtml(b.reason || "")}</td>` +
    `<td>${kestrel.statusLabel(b.status, b)}${disabled}</td>` +
    '<td class="kp-actions">' +
    `<button type="button" class="btn btn-success btn-xs" data-domain="${d}" data-protect="0"><i class="fa fa-rotate-left"></i> Unblock</button>` +
    `<button type="button" class="btn btn-default btn-xs" data-domain="${d}" data-protect="1" title="Unblock it, and add it to Never block so it is never blocked again"><i class="fa fa-shield-halved"></i> Never block</button>` +
    "</td></tr>"
  );
}

async function load() {
  const client = $("#kp-device").val();
  const body = $("#kp-broke tbody").empty();
  if (!client) return;
  const minutes = $("#kp-minutes").val();
  const r = await kestrel.api(`/broke?client=${encodeURIComponent(client)}&minutes=${minutes}`);
  const name = $("#kp-device option:selected").text();
  const others =
    r.other_blocked > 0
      ? ` It also had ${r.other_blocked} lookup(s) blocked by the block lists, which KestrelPro didn't add; see the <a href="${document.body.dataset.webhome}queries?client_ip=${encodeURIComponent(client)}&upstream=blocklist">Query Log</a>.`
      : "";
  $("#kp-broke-summary").html(
    (r.blocks.length > 0
      ? `<strong>${r.blocks.length}</strong> KestrelPro block(s) hit ${utils.escapeHtml(name)}. The busiest one is the usual suspect.`
      : `KestrelPro didn't block anything for ${utils.escapeHtml(name)} in this period.`) + others
  );
  for (const b of r.blocks) body.append(row(b));
}

$(() => {
  kestrel.refreshStatus().catch(() => {});
  kestrel
    .api("/devices")
    .then(devices => {
      const sel = $("#kp-device").empty().append('<option value="">Choose a device…</option>');
      for (const d of devices) {
        const label = d.name ? `${d.name} (${d.ip})` : d.ip;
        sel.append($("<option>").val(d.ip).text(label));
      }

      const preset = utils.parseQueryString().client;
      if (preset) {
        if (sel.find(`option[value="${CSS.escape(preset)}"]`).length === 0) {
          sel.append($("<option>").val(preset).text(preset));
        }

        sel.val(preset);
        load().catch(() => {});
      }
    })
    .catch(() => {});

  $("#kp-device, #kp-minutes").on("change", () => load().catch(() => {}));
  $("#kp-broke").on("click", "button[data-domain]", async function () {
    const btn = $(this);
    const domain = btn.data("domain");
    btn.prop("disabled", true);
    try {
      await kestrel.decide(domain, "unblock");
      if (btn.data("protect") === 1) {
        const s = await kestrel.api("/settings");
        const list = [...new Set([...(s.protected_extra || []), domain])];
        await kestrel.api("/settings", { method: "POST", body: { protected_extra: list } });
        utils.showAlert("success", "fas fa-shield-halved", "Added to Never block", domain);
      }
    } finally {
      load().catch(() => {});
    }
  });
});
