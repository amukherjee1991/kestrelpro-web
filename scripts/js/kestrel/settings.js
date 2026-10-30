/* KestrelPro: AI review settings.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

function fill(s) {
  $(`input[name="mode"][value="${s.mode}"]`).prop("checked", true);
  $(`input[name="cadence"][value="${s.cadence}"]`).prop("checked", true);
  $("#kp-confidence").val(Math.round(s.min_confidence * 100));
  $("#kp-confidence-value").text(Math.round(s.min_confidence * 100));
  $("#kp-model").val(s.model);
  $("#kp-interval").val(Math.round(s.interval_seconds / 60));
  $("#kp-protected").val((s.protected_extra || []).join("\n"));
  $("#kp-probation").val(s.probation_hours);
  $("#kp-storm-devices").val(s.storm_devices);
  $("#kp-storm-lookups").val(s.storm_lookups);
  $("#kp-few-shot").prop("checked", Boolean(s.few_shot));

  $('input[name="category"]').each((_i, el) => {
    el.checked = s.block_categories.includes(el.value);
  });

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
      few_shot: $("#kp-few-shot").is(":checked"),
      probation_hours: Number($("#kp-probation").val()),
      storm_devices: Number($("#kp-storm-devices").val()),
      storm_lookups: Number($("#kp-storm-lookups").val()),
    };
    const saved = await kestrel.api("/settings", { method: "POST", body });
    fill({ ...saved, protected_builtin: $("#kp-builtin li").map((_i, el) => el.textContent).get() });
    utils.showAlert("success", "fas fa-check", "Saved", "AI review settings");
  });
});
