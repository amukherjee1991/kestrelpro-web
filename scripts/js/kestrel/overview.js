/* KestrelPro: AI review overview.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false, Chart: false */

"use strict";

const CATEGORIES = ["ads", "tracking", "telemetry", "malicious", "unknown", "legitimate"];
let categoryChart = null;

function stateLine(s) {
  const mode = s.settings.mode === "auto" ? "Automatic" : "Review first";
  const cadence = s.settings.cadence === "eco" ? "every " + s.settings.interval_seconds / 60 + " min" : "in real time";
  let doing = "Idle";
  if (s.running) doing = "Reviewing now";
  else if (s.queued > 0) doing = s.queued + " domain(s) queued";
  const last = s.last_finished ? "last checked " + utils.datetimeRelative(s.last_finished) : "not run yet";
  const trial =
    s.safety.on_probation > 0 ? ` ${s.safety.on_probation} automatic block(s) on trial.` : "";
  const pauseButton = s.safety.paused
    ? '<button type="button" class="btn btn-primary btn-sm" id="kp-pause" data-act="resume"><i class="fa fa-play" aria-hidden="true"></i> Resume KestrelPro Blocks</button>'
    : '<button type="button" class="btn btn-default btn-sm" id="kp-pause" data-act="pause" title="Turns off every block KestrelPro added, without deleting anything"><i class="fa fa-pause" aria-hidden="true"></i> Pause KestrelPro Blocks</button>';
  $("#kp-state").html(
    `<span class="kp-state-text"><strong>${mode}</strong> mode, reviewing ${cadence}. ${doing}, ${last}.${trial}</span>` +
      '<span class="kp-state-actions"><button type="button" class="btn btn-default btn-sm" id="kp-run"><i class="fa fa-rotate" aria-hidden="true"></i> Check Now</button>' +
      pauseButton +
      "</span>"
  );
  $("#kp-pause").on("click", async function () {
    const act = $(this).data("act");
    if (act === "pause" && !confirm("Turn off every block KestrelPro added? Nothing is deleted; Resume turns them back on.")) {
      return;
    }

    const r = await kestrel.api("/" + act, { method: "POST" });
    utils.showAlert("success", "fas fa-check", act === "pause" ? "Paused" : "Resumed", `${r.entries} KestrelPro block(s)`);
    load();
  });
  $("#kp-run").on("click", async () => {
    await kestrel.api("/run", { method: "POST" });
    utils.showAlert("info", "", "Check started", "");
    setTimeout(load, 1500);
  });
}

function tiles(s) {
  $("#kp-reviewed").text(s.reviewed_today.toLocaleString());
  $("#kp-reviewed-total").text(s.reviewed_total.toLocaleString());
  if (s.settings.mode === "auto") {
    $("#kp-second-label").text("Blocked automatically, 24 h");
    $("#kp-second").text(s.auto_blocked_today.toLocaleString());
    $("#kp-second-link").html('See history <i class="fa fa-arrow-circle-right"></i>').attr("href", document.body.dataset.webhome + "kestrel/history?what=auto");
  } else {
    $("#kp-second").text(s.pending.toLocaleString());
  }

  $("#kp-blocked").text(s.blocked_total.toLocaleString());
  $("#kp-blocked-today").text(s.blocked_today.toLocaleString());
  let model = "Not loaded";
  if (!s.model.reachable) model = "Offline";
  else if (s.model.loaded) model = s.model.on_gpu ? "On GPU" : "On CPU";
  $("#kp-model-state").text(model);
  $("#kp-model").text(s.settings.model);
}

function drawCategories(charts) {
  const reviewed = CATEGORIES.map(c => charts.reviewed_by_category[c] || 0);
  const flagged = CATEGORIES.map(c => charts.flagged_by_category[c] || 0);
  const ticks = utils.getCSSval("graphs-ticks", "color");
  const css = getComputedStyle(document.documentElement);
  const token = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
  const grid = utils.getCSSval("graphs-grid", "background-color");
  const data = {
    labels: CATEGORIES.map(c => c[0].toUpperCase() + c.slice(1)),
    datasets: [
      { label: "Reviewed", data: reviewed, backgroundColor: token("--kp-border-strong", "rgba(120, 120, 120, 0.5)"), borderRadius: 4 },
      { label: "Flagged", data: flagged, backgroundColor: token("--kp-accent", "#b4532a"), borderRadius: 4 },
    ],
  };
  if (categoryChart) {
    categoryChart.data = data;
    categoryChart.update("none");
    return;
  }

  categoryChart = new Chart(document.getElementById("kp-categories"), {
    type: "bar",
    data,
    options: {
      indexAxis: "y",
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { labels: { color: ticks } } },
      scales: {
        x: { ticks: { color: ticks, precision: 0 }, grid: { color: grid } },
        y: { ticks: { color: ticks }, grid: { display: false } },
      },
    },
  });
}

function recent(rows) {
  const body = $("#kp-recent tbody").empty();
  if (rows.length === 0) {
    body.append('<tr><td colspan="4" class="text-muted">Nothing flagged yet. KestrelPro is keeping watch.</td></tr>');
    return;
  }

  for (const r of rows.slice(0, 8)) {
    body.append(
      `<tr><td class="kp-domain">${utils.escapeHtml(r.domain)}</td><td>${kestrel.categoryLabel(r.category)}</td>` +
        `<td>${kestrel.statusLabel(r.status, r)}</td><td class="hidden-xs kp-when">${utils.datetime(r.updated_at, false, true)}</td></tr>`
    );
  }
}

async function load() {
  const s = await kestrel.refreshStatus();
  stateLine(s);
  tiles(s);
  const [charts, flagged] = await Promise.all([
    kestrel.api("/charts"),
    kestrel.api("/decisions?status=flagged&limit=8"),
  ]);
  drawCategories(charts);
  recent(flagged);
}

$(() => {
  load().catch(() => {});
  utils.setInter(() => load().catch(() => {}), 10000);
});
