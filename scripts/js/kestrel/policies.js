/* KestrelPro: per-device policies.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const MODE_TEXT = {
  inherit: "Same as AI settings",
  review: "Review first",
  auto: "Automatic",
  off: "Off (never flag)",
};
const KINDS = { ads: "Ads", tracking: "Tracking", telemetry: "Telemetry", malicious: "Malicious" };

function devicesCell(g) {
  if (g.default) return '<span class="text-muted">Every device not in another group</span>';
  if (g.clients.length === 0) {
    return `<a href="${document.body.dataset.webhome}groups/clients">Add devices</a>`;
  }

  const shown = g.clients.slice(0, 3).map(c => `<code>${utils.escapeHtml(c)}</code>`);
  if (g.clients.length > 3) shown.push(`<span class="text-muted">+${g.clients.length - 3}</span>`);
  return shown.join(" ");
}

function row(g) {
  // A device only in this group gets no block lists unless they're assigned to it as well.
  const noLists =
    !g.default && g.block_lists === 0
      ? `<div class="kp-group-warning"><i class="fa fa-triangle-exclamation" aria-hidden="true"></i> No block lists. ` +
        `Devices only in this group skip your lists; <a href="${document.body.dataset.webhome}groups/lists">assign the lists</a> ` +
        "to it too, or keep the devices in Default as well.</div>"
      : "";
  const name =
    `<strong>${utils.escapeHtml(g.name)}</strong>${g.enabled ? "" : ' <span class="label label-default">disabled</span>'}` +
    noLists;
  if (g.default) {
    const e = g.effective;
    return (
      `<tr><td>${name}</td><td>${devicesCell(g)}</td>` +
      `<td>${MODE_TEXT[e.mode] || e.mode} <span class="text-muted">(from <a href="${document.body.dataset.webhome}kestrel/settings">AI settings</a>)</span></td>` +
      `<td>${Math.round(e.min_confidence * 100)}%</td><td>${e.block_categories.map(c => KINDS[c] || c).join(", ")}</td><td></td></tr>`
    );
  }

  const p = g.policy;
  const modes = Object.entries(MODE_TEXT)
    .map(([value, text]) => `<option value="${value}"${p.mode === value ? " selected" : ""}>${text}</option>`)
    .join("");
  const own = p.block_categories !== null;
  const kinds = Object.entries(KINDS)
    .map(([k, text]) => {
      const checked = (own ? p.block_categories : g.effective.block_categories).includes(k) ? " checked" : "";
      return `<label class="kp-kind"><input type="checkbox" data-kind="${k}"${checked}${own ? "" : " disabled"}> ${text}</label>`;
    })
    .join("");
  return (
    `<tr data-group="${g.id}"><td>${name}</td><td>${devicesCell(g)}</td>` +
    `<td><label class="sr-only" for="kp-mode-${g.id}">Mode for ${utils.escapeHtml(g.name)}</label>` +
    `<select class="form-control input-sm" id="kp-mode-${g.id}" data-field="mode">${modes}</select></td>` +
    `<td><label class="sr-only" for="kp-conf-${g.id}">Threshold for ${utils.escapeHtml(g.name)}</label>` +
    `<div class="input-group input-group-sm kp-conf-input"><input type="number" class="form-control" id="kp-conf-${g.id}" data-field="conf" min="50" max="100"` +
    ` value="${p.min_confidence === null ? "" : Math.round(p.min_confidence * 100)}" placeholder="${Math.round(g.effective.min_confidence * 100)}"><span class="input-group-addon">%</span></div></td>` +
    `<td><label class="kp-kind kp-kind-own"><input type="checkbox" data-field="own"${own ? " checked" : ""}> Own choice</label><div class="kp-kinds">${kinds}</div></td>` +
    `<td class="kp-actions"><button type="button" class="btn btn-primary btn-xs" data-save="${g.id}"><i class="fa fa-floppy-disk" aria-hidden="true"></i> Save</button></td></tr>`
  );
}

async function load() {
  const r = await kestrel.api("/policies");
  const body = $("#kp-policies tbody").empty();
  for (const g of r.groups) body.append(row(g));
  if (r.groups.length <= 1) {
    body.append(
      `<tr><td colspan="6" class="text-muted">Only the Default group exists. <a href="${document.body.dataset.webhome}groups">Create a group</a>, put devices in it, and give it a policy here.</td></tr>`
    );
  }
}

$(() => {
  kestrel.refreshStatus().catch(() => {});
  load().catch(() => {});
  const table = $("#kp-policies");
  table.on("change", 'input[data-field="own"]', function () {
    $(this).closest("tr").find("input[data-kind]").prop("disabled", !this.checked);
  });
  table.on("click", "button[data-save]", async function () {
    const tr = $(this).closest("tr");
    const conf = tr.find('[data-field="conf"]').val();
    const own = tr.find('[data-field="own"]').is(":checked");
    const body = {
      mode: tr.find('[data-field="mode"]').val(),
      min_confidence: conf === "" ? null : Number(conf) / 100,
      block_categories: own
        ? tr
            .find("input[data-kind]:checked")
            .map((_i, el) => el.dataset.kind)
            .get()
        : null,
    };
    await kestrel.api("/policies/" + tr.data("group"), { method: "POST", body });
    utils.showAlert("success", "fas fa-check", "Saved", tr.find("strong").first().text());
    load().catch(() => {});
  });
});
