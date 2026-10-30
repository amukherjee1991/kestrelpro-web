/* KestrelPro: suggestions (block-list false positives, site-wide rules).
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const esc = utils.escapeHtml;
const btn = (attrs, cls, icon, text) =>
  `<button type="button" class="btn btn-${cls} btn-xs" ${attrs}><i class="fa fa-${icon}" aria-hidden="true"></i> ${text}</button>`;

function listsCell(lists) {
  if (!lists || lists.length === 0) return '<span class="text-muted">–</span>';
  return lists
    .slice(0, 2)
    .map(l => {
      const label = l.kind === "list" ? "list" : `${esc(l.kind || "rule")} rule`;
      const addr = esc(l.address || "");
      return `<div class="kp-list-src" title="${addr}">${label} <code>${addr.replace(/^https?:\/\//, "").slice(0, 48)}</code></div>`;
    })
    .join("");
}

function render(r) {
  const lc = r.list_checks;
  $("#kp-sg-checks").text(
    lc.per_hour > 0
      ? `${lc.checked} checked, ${lc.waiting} waiting, up to ${lc.per_hour} an hour`
      : "Second looks are off (AI settings)"
  );

  const fb = $("#kp-sg-false tbody").empty();
  if (r.false_blocks.length === 0) {
    fb.append('<tr><td colspan="5" class="text-muted">Nothing suspicious so far. The model agrees with your lists on everything it has looked at.</td></tr>');
  }

  for (const f of r.false_blocks) {
    const d = esc(f.domain);
    fb.append(
      `<tr><td class="kp-domain">${d}</td>` +
        `<td>${kestrel.categoryLabel(f.category)} <span class="text-muted kp-conf">${kestrel.percent(f.confidence)}</span>` +
        `<div class="text-muted small">${esc(f.reason || "")}</div></td>` +
        `<td>${kestrel.devices(f.clients)}<div class="text-muted small">${f.lookups} blocked lookup(s)</div></td>` +
        `<td>${listsCell(f.lists)}</td>` +
        `<td class="kp-actions">${btn(`data-fb="allow" data-domain="${d}"`, "success", "check", "Allow")}` +
        `${btn(`data-fb="dismiss" data-domain="${d}"`, "default", "xmark", "Keep blocked")}</td></tr>`
    );
  }

  const sites = $("#kp-sg-sites tbody").empty();
  if (r.sites.length === 0) sites.append('<tr><td colspan="4" class="text-muted">No site has three or more blocked domains.</td></tr>');
  for (const s of r.sites) {
    const site = esc(s.site);
    const shown = s.domains.slice(0, 4).map(x => `<code>${esc(x)}</code>`).join(" ");
    const more = s.domains.length > 4 ? ` <span class="text-muted">+${s.domains.length - 4}</span>` : "";
    sites.append(
      `<tr><td><strong>${site}</strong></td><td>${s.domains.length}<div class="small">${shown}${more}</div></td>` +
        `<td><code>${esc(s.regex)}</code></td>` +
        `<td class="kp-actions">${btn(`data-site="block" data-name="${site}"`, "danger", "ban", "Block site")}` +
        `${btn(`data-site="dismiss" data-name="${site}"`, "default", "xmark", "Dismiss")}</td></tr>`
    );
  }

  const rules = $("#kp-sg-rules tbody").empty();
  if (r.rules.length === 0) rules.append('<tr><td colspan="3" class="text-muted">None yet.</td></tr>');
  for (const rule of r.rules) {
    const site = esc(rule.site);
    rules.append(
      `<tr><td><strong>${site}</strong><div><code>${esc(rule.regex)}</code></div></td>` +
        `<td class="kp-when">${utils.datetime(rule.added_at, false, true)}</td>` +
        `<td class="kp-actions">${btn(`data-site="unblock" data-name="${site}"`, "default", "rotate-left", "Remove")}</td></tr>`
    );
  }
}

async function load() {
  render(await kestrel.api("/suggestions"));
}

$(() => {
  kestrel.refreshStatus().catch(() => {});
  load().catch(() => {});

  $("#kp-sg-false").on("click", "button[data-fb]", async function () {
    const action = $(this).data("fb");
    const domain = $(this).data("domain");
    $(this).prop("disabled", true);
    try {
      await kestrel.api("/suggestions/false-blocks/" + encodeURIComponent(domain), { method: "POST", body: { action } });
      utils.showAlert("success", "fas fa-check", action === "allow" ? "Allowed" : "Kept blocked", domain);
    } finally {
      load().catch(() => {});
      kestrel.refreshStatus().catch(() => {});
    }
  });

  $("#kp-sg-sites, #kp-sg-rules").on("click", "button[data-site]", async function () {
    const action = $(this).data("site");
    const site = $(this).data("name");
    if (action === "block" && !confirm(`Block every domain of ${site}, including ones not seen yet?`)) return;
    $(this).prop("disabled", true);
    try {
      await kestrel.api("/suggestions/sites/" + encodeURIComponent(site), { method: "POST", body: { action } });
      const done = { block: "Site blocked", unblock: "Site rule removed", dismiss: "Dismissed" }[action];
      utils.showAlert("success", "fas fa-check", done, site);
    } finally {
      load().catch(() => {});
      kestrel.refreshStatus().catch(() => {});
    }
  });
});
