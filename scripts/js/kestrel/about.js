/* KestrelPro: about page.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global kestrel: false */

"use strict";

$(() => {
  kestrel
    .api("/healthz")
    .then(h => {
      $("#kp-about-engine").text("running");
      $("#kp-about-prompt").text(h.prompt_version);
    })
    .catch(() => $("#kp-about-engine").text("not reachable"));
});
