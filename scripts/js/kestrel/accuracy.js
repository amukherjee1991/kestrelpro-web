/* KestrelPro: accuracy against your own decisions.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const pct = x => (x === null || x === undefined ? "–" : Math.round(x * 100) + "%");

function rows(selector, items, render, empty) {
  const body = $(selector + " tbody").empty();
  if (items.length === 0) {
    body.append(`<tr><td colspan="5" class="text-muted">${empty}</td></tr>`);
    return;
  }

  for (const item of items) body.append(render(item));
}

async function load() {
  const [r, settings] = await Promise.all([kestrel.api("/accuracy"), kestrel.api("/settings")]);
  const o = r.overall;
  $("#kp-acc-n").text(o.labelled.toLocaleString());
  $("#kp-acc-agree").text(pct(o.agreement));
  $("#kp-acc-agree-sub").text(o.labelled ? `${o.agree} of ${o.labelled} decisions` : "No decisions yet");
  $("#kp-acc-fp").text(o.flagged_wrong.toLocaleString());
  $("#kp-acc-fp-sub").text(
    o.flagged_right + o.flagged_wrong > 0 ? `${pct(o.precision)} of its flags were right` : "No flags graded yet"
  );
  $("#kp-acc-fn").text(o.missed.toLocaleString());
  $("#kp-acc-empty").toggleClass("hidden", o.labelled > 0);

  rows(
    "#kp-acc-cat",
    r.by_category,
    c =>
      `<tr><td>${kestrel.categoryLabel(c.category)}</td><td>${c.labelled}</td><td>${c.you_blocked}</td><td>${pct(c.agreement)}</td></tr>`,
    "No decisions yet."
  );
  rows(
    "#kp-acc-model",
    r.by_model,
    m =>
      `<tr><td><code>${utils.escapeHtml(m.model)}</code></td><td>${m.labelled}</td><td>${pct(m.agreement)}</td><td>${pct(m.precision)}</td></tr>`,
    "No decisions yet."
  );
  rows(
    "#kp-acc-dis",
    r.disagreements,
    d =>
      `<tr><td class="kp-domain">${utils.escapeHtml(d.domain)}</td>` +
      `<td>${kestrel.categoryLabel(d.category)} <span class="text-muted kp-conf">${kestrel.percent(d.confidence)}</span></td>` +
      `<td>${d.blocked ? '<span class="label label-danger">Blocked</span>' : '<span class="label label-success">Kept</span>'}</td>` +
      `<td class="kp-reason">${utils.escapeHtml(d.reason || "")}</td>` +
      `<td class="kp-when">${utils.datetime(d.at, false, true)}</td></tr>`,
    "None. The model and you agree on everything so far."
  );
  $("#kp-acc-fewshot").html(
    settings.few_shot
      ? "Your recent decisions are shown to the model as examples (from 4 decisions on). " +
          `Turn this off in <a href="${document.body.dataset.webhome}kestrel/settings">AI settings</a>.`
      : "Your decisions are not shown to the model. " +
          `Turn on <em>Learn from my decisions</em> in <a href="${document.body.dataset.webhome}kestrel/settings">AI settings</a>.`
  );
}

$(() => {
  kestrel.refreshStatus().catch(() => {});
  load().catch(() => {});
});
