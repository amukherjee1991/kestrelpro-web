/* KestrelPro: AI review settings.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

const BLOCKABLE = {
  ads: "Ads",
  tracking: "Tracking and analytics",
  telemetry: "Product telemetry",
  malicious: "Malware, phishing and scams",
};

function fill(s) {
  $(`input[name="mode"][value="${s.mode}"]`).prop("checked", true);
  $(`input[name="cadence"][value="${s.cadence}"]`).prop("checked", true);
  $("#kp-confidence").val(Math.round(s.min_confidence * 100));
  $("#kp-confidence-value").text(Math.round(s.min_confidence * 100));
  $("#kp-model").val(s.model);
  $("#kp-interval").val(Math.round(s.interval_seconds / 60));
  $("#kp-protected").val((s.protected_extra || []).join("\n"));

  const box = $("#kp-categories").empty();
  for (const [key, label] of Object.entries(BLOCKABLE)) {
    const checked = s.block_categories.includes(key) ? " checked" : "";
    box.append(
      `<div><input type="checkbox" name="category" id="kp-cat-${key}" value="${key}"${checked}>` +
        `<label for="kp-cat-${key}">${utils.escapeHtml(label)}</label></div>`
    );
  }

  const builtin = s.protected_builtin || [];
  $("#kp-builtin-count").text(builtin.length);
  $("#kp-builtin").html(builtin.map(d => `<li>${utils.escapeHtml(d)}</li>`).join(""));
}

$(() => {
  kestrel.api("/settings").then(fill).catch(() => {});
  kestrel.refreshStatus().catch(() => {});

  $("#kp-confidence").on("input", function () {
    $("#kp-confidence-value").text(this.value);
  });

  $("#kp-settings").on("submit", async event => {
    event.preventDefault();
    const body = {
      mode: $('input[name="mode"]:checked').val(),
      cadence: $('input[name="cadence"]:checked').val(),
      min_confidence: Number($("#kp-confidence").val()) / 100,
      interval_seconds: Number($("#kp-interval").val()) * 60,
      block_categories: $('input[name="category"]:checked')
        .map((_i, el) => el.value)
        .get(),
      protected_extra: $("#kp-protected")
        .val()
        .split(/[\s,]+/)
        .map(d => d.trim().toLowerCase())
        .filter(Boolean),
      model: $("#kp-model").val().trim(),
    };
    const saved = await kestrel.api("/settings", { method: "POST", body });
    fill({ ...saved, protected_builtin: $("#kp-builtin li").map((_i, el) => el.textContent).get() });
    utils.showAlert("success", "fas fa-check", "Saved", "AI review settings");
  });
});
