/* KestrelPro: helpers shared by the KestrelPro pages.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false */

"use strict";

globalThis.kestrel = (function () {
  const cfg = globalThis.kestrelConfig || {};
  const base = cfg.engineUrl
    ? cfg.engineUrl.replace(/\/$/, "")
    : `${location.protocol}//${location.hostname}:${cfg.enginePort || 8090}/admin/api/kestrel`;
  const csrf = () => $('meta[name="csrf-token"]').attr("content");

  const CATEGORY_CLASS = {
    ads: "label-danger",
    tracking: "label-warning",
    telemetry: "label-info",
    malicious: "kp-label-malicious",
    legitimate: "label-success",
    unknown: "label-default",
  };
  const STATUS_TEXT = {
    blocked: ["Blocked by KestrelPro", "label-danger"],
    user_blocked: ["Blocked by you", "label-danger"],
    pending: ["Needs approval", "label-warning"],
    allowed: ["Allowed", "label-success"],
    user_allowed: ["Allowed by you", "label-success"],
  };
  const ACTION_TEXT = {
    auto_blocked: ["Blocked automatically", "fa-robot"],
    flagged: ["Flagged for approval", "fa-flag"],
    approved: ["Block approved", "fa-check"],
    user_blocked: ["Blocked by you", "fa-ban"],
    unblocked: ["Unblocked", "fa-rotate-left"],
    rejected: ["Not blocked", "fa-xmark"],
    probation_reverted: ["Trial block withdrawn", "fa-life-ring"],
  };

  function banner(kind, html) {
    const el = $("#kp-banner");
    if (!html) {
      el.addClass("hidden").empty();
      return;
    }

    el.removeClass("hidden alert-danger alert-warning alert-info")
      .addClass("alert-" + kind)
      .html(html);
  }

  async function api(path, options = {}) {
    const write = options.method && options.method !== "GET";
    const headers = { Accept: "application/json" };
    if (write) {
      headers["Content-Type"] = "application/json";
      headers["X-CSRF-TOKEN"] = csrf();
    }

    let response;
    try {
      response = await fetch(base + path, {
        credentials: "include",
        method: options.method || "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
      });
    } catch (error) {
      if (options.quiet) throw error;
      const https = location.protocol === "https:" && !cfg.engineUrl;
      banner(
        "danger",
        "<strong>Couldn't reach the KestrelPro engine.</strong> " +
          (https
            ? "This page is served over HTTPS, so the engine has to be reached through the same " +
              "address: set <code>KESTREL_ENGINE_URL</code> and add the reverse-proxy route."
            : "It may be restarting, or it is turned off (<code>KESTREL_ENGINE=off</code>). " +
              "DNS blocking is not affected.")
      );
      throw error;
    }

    if (response.status === 401) {
      if (options.quiet) throw new Error("unauthorized");
      banner(
        "warning",
        "Your session has expired. <a href='" +
          document.body.dataset.webhome +
          "login'>Sign in again</a>."
      );
      throw new Error("unauthorized");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = data.message || data.error || response.statusText;
      if (!options.quiet) utils.showAlert("error", "", "KestrelPro", message);
      throw new Error(message);
    }

    return data;
  }

  function categoryLabel(category) {
    const cls = CATEGORY_CLASS[category] || "label-default";
    return `<span class="label ${cls} kp-cat">${utils.escapeHtml(category || "")}</span>`;
  }

  // `row` (optional) adds the trial period of a fresh automatic block.
  function statusLabel(status, row) {
    const [text, cls] = STATUS_TEXT[status] || [status || "", "label-default"];
    let trial = "";
    if (row && status === "blocked" && row.probation_until > Date.now() / 1000) {
      const until = utils.datetime(row.probation_until, false, false);
      trial = ` <span class="label label-default" title="Withdrawn automatically if something breaks before ${until}">on trial</span>`;
    }

    return `<span class="label ${cls}">${utils.escapeHtml(text)}</span>${trial}`;
  }

  function actionLabel(action) {
    const [text, icon] = ACTION_TEXT[action] || [action, "fa-circle"];
    return `<i class="fa fa-fw ${icon}"></i> ${utils.escapeHtml(text)}`;
  }

  function percent(fraction) {
    return fraction === null || fraction === undefined ? "–" : Math.round(fraction * 100) + "%";
  }

  function devices(clients, max = 3) {
    if (!clients || clients.length === 0) return '<span class="text-muted">–</span>';
    const shown = clients.slice(0, max).map(c => {
      const name = utils.escapeHtml(c.name || c.ip);
      const vpn = c.network === "vpn" ? ' <span class="label label-primary">VPN</span>' : "";
      return `<span class="kp-device" title="${utils.escapeHtml(c.ip)} · ${c.lookups} lookup(s)">${name}${vpn}</span>`;
    });
    if (clients.length > max) shown.push(`<span class="text-muted">+${clients.length - max}</span>`);
    return shown.join(", ");
  }

  // Engine health, problems and the sidebar badge. Pages call this on load and on a timer.
  async function refreshStatus() {
    const s = await api("/status");
    $("#num_kestrel_pending").text(s.pending > 0 ? s.pending : "");
    const problems = [];
    if (s.last_error) problems.push(utils.escapeHtml(s.last_error));
    for (const w of s.warnings || []) problems.push(utils.escapeHtml(w));
    if (!s.model.reachable) {
      problems.push("The model server isn't answering, so new domains wait in the queue.");
    } else if (s.model.loaded && s.model.on_gpu === false) {
      problems.push("The model is running on the CPU, not the graphics card, so reviews are slow.");
    }

    if (s.safety && s.safety.paused) {
      problems.unshift(
        "<strong>KestrelPro blocks are paused.</strong> Nothing KestrelPro added is being blocked, " +
          "and new suggestions wait for approval. " +
          `<a href="${document.body.dataset.webhome}kestrel">Resume on the AI review page</a>.`
      );
    }

    if (problems.length > 0) banner("warning", problems.join("<br>"));
    else banner();
    return s;
  }

  async function decide(domain, action) {
    const r = await api("/decisions/" + encodeURIComponent(domain), { method: "POST", body: { action } });
    const done = {
      block: "Blocked",
      approve: "Blocked",
      unblock: "Unblocked",
      reject: "Won't be blocked",
    }[action];
    utils.showAlert("success", "fas fa-check", done, domain);
    if (r.reverted && r.reverted.length > 0) {
      utils.showAlert(
        "info",
        "fas fa-life-ring",
        "Also sent back for review",
        r.reverted.join(", ") + " (same site, still on trial)"
      );
    }

    return r;
  }

  return {
    base,
    api,
    banner,
    categoryLabel,
    statusLabel,
    actionLabel,
    percent,
    devices,
    refreshStatus,
    decide,
  };
})();
