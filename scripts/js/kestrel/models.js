/* KestrelPro: model management.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const gb = bytes => (bytes ? (bytes / 1e9).toFixed(1) + " GB" : "–");
let pollTimer = null;

function modelRow(m, pinned) {
  const name = utils.escapeHtml(m.name);
  let status = '<span class="text-muted">Not loaded</span>';
  if (m.loaded) status = m.on_gpu ? '<span class="label label-success">On GPU</span>' : '<span class="label label-warning">On CPU</span>';
  const inUse = m.in_use ? ' <span class="label label-primary">In use</span>' : "";
  const changed = m.in_use && pinned && m.digest !== pinned ? ' <span class="label label-warning">Changed since pinned</span>' : "";
  const details = [m.parameter_size, m.quantization].filter(Boolean).join(" · ");
  const btn = (act, cls, icon, text, extra = "") =>
    `<button type="button" class="btn btn-${cls} btn-xs" data-act="${act}" data-name="${name}"${extra}><i class="fa fa-${icon}" aria-hidden="true"></i> ${text}</button>`;
  let actions = btn("benchmark", "default", "gauge", "Benchmark");
  if (!m.in_use) actions = btn("use", "primary", "check", "Use") + actions + btn("delete", "default", "trash", "Delete", ` aria-label="Delete ${name}"`);
  else if (changed) actions = btn("use", "primary", "thumbtack", "Re-pin") + actions;
  return (
    `<tr><td><code>${name}</code>${inUse}${changed}<div class="text-muted small">${utils.escapeHtml(details)}</div></td>` +
    `<td>${gb(m.size)}</td><td><code title="${utils.escapeHtml(m.digest || "")}">${utils.escapeHtml((m.digest || "").replace("sha256:", "").slice(0, 12))}</code></td>` +
    `<td>${status}</td><td class="kp-actions">${actions}</td></tr>`
  );
}

function renderJobs(jobs) {
  const pulls = Object.entries(jobs.pulls || {});
  $("#kp-pulls").html(
    pulls
      .map(([name, j]) => {
        const p = j.total ? Math.round((j.completed / j.total) * 100) : 0;
        const state = j.error
          ? `<span class="text-red">${utils.escapeHtml(j.error)}</span>`
          : j.done
            ? '<span class="text-green">Downloaded</span>'
            : `${utils.escapeHtml(j.status)}…`;
        return (
          `<div class="kp-pull"><div><code>${utils.escapeHtml(name)}</code> ${state}</div>` +
          (j.done ? "" : `<div class="progress progress-xs"><div class="progress-bar" style="width:${p}%"></div></div>`) +
          "</div>"
        );
      })
      .join("")
  );
  const b = jobs.benchmark;
  $("#kp-bench-running").html(
    b && !b.done
      ? `<p>Benchmarking <code>${utils.escapeHtml(b.model)}</code>: ${b.progress} of ${b.total} domains…</p>` +
          `<div class="progress progress-xs"><div class="progress-bar" style="width:${Math.round((b.progress / b.total) * 100)}%"></div></div>`
      : b && b.error
        ? `<p class="text-red">${utils.escapeHtml(b.error)}</p>`
        : ""
  );
  return pulls.some(([, j]) => !j.done) || (b && !b.done);
}

function renderBenchmarks(list) {
  const body = $("#kp-benchmarks tbody").empty();
  if (list.length === 0) {
    body.append('<tr><td colspan="6" class="text-muted">No benchmarks yet.</td></tr>');
    return;
  }

  for (const b of list) {
    const agreement = b.labelled ? Math.round((b.agree / b.labelled) * 100) + "%" : "–";
    body.append(
      `<tr><td><code>${utils.escapeHtml(b.model)}</code></td><td><strong>${agreement}</strong> <span class="text-muted">(${b.agree}/${b.labelled})</span></td>` +
        `<td>${b.flagged_wrong}</td><td>${b.missed}</td><td>${Math.round(b.seconds)} s</td>` +
        `<td class="kp-when">${utils.datetime(b.finished_at, false, true)}</td></tr>`
    );
  }
}

async function load() {
  const r = await kestrel.api("/models");
  const body = $("#kp-models tbody").empty();
  if (r.installed.length === 0) body.append('<tr><td colspan="5" class="text-muted">No models installed. Download one below.</td></tr>');
  for (const m of r.installed) body.append(modelRow(m, r.pinned));
  renderBenchmarks(r.benchmarks);
  const busy = renderJobs(r.jobs);
  clearTimeout(pollTimer);
  if (busy) pollTimer = setTimeout(() => load().catch(() => {}), 1500);
}

$(() => {
  kestrel.refreshStatus().catch(() => {});
  load().catch(() => {});

  $("#kp-pull-form").on("submit", async event => {
    event.preventDefault();
    const name = $("#kp-pull-name").val().trim();
    if (!name) return;
    await kestrel.api("/models/pull", { method: "POST", body: { name } });
    $("#kp-pull-name").val("");
    load().catch(() => {});
  });

  $("#kp-models").on("click", "button[data-act]", async function () {
    const act = $(this).data("act");
    const name = $(this).data("name");
    if (act === "delete" && !confirm(`Delete ${name} from the model server? You can download it again later.`)) return;
    $(this).prop("disabled", true);
    try {
      await kestrel.api("/models/" + act, { method: "POST", body: { name } });
      const done = { use: `Now using ${name}`, delete: `Deleted ${name}`, benchmark: `Benchmarking ${name}` }[act];
      utils.showAlert("success", "fas fa-check", done, "");
      if (act === "use") kestrel.refreshStatus().catch(() => {});
    } finally {
      load().catch(() => {});
    }
  });
});
