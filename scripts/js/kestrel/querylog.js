/* KestrelPro: AI verdicts in the Query Log.
 *  queries.js calls kestrelQueryLog.decorate() after every table draw. Rows whose domain has
 *  a verdict get an "AI" badge; clicking it shows the verdict, why the DNS server blocked
 *  the domain (if it did), and one-click actions.
 *  Part of KestrelPro, a modified version of Pi-hole's web interface.
 *
 *  This file is copyright under the latest version of the EUPL.
 *  Please see LICENSE file for your rights under this license. */

/* global utils: false, kestrel: false */

"use strict";

globalThis.kestrelQueryLog = (function () {
  const CACHE_MS = 60_000;
  const cache = new Map(); // domain -> {verdict (or null), at}
  let modal = null;

  const norm = d => String(d || "").toLowerCase().replace(/\.$/, "");

  function badge(v) {
    const conf = kestrel.percent(v.confidence);
    const title = `AI: ${v.category} (${conf}). ${v.reason || ""}`;
    const cls =
      v.status === "blocked" || v.status === "user_blocked"
        ? "label-danger"
        : v.status === "pending"
          ? "label-warning"
          : "label-default";
    return (
      ` <span class="label ${cls} kp-ai" role="button" tabindex="0" data-domain="${utils.escapeHtml(v.domain)}"` +
      ` title="${utils.escapeHtml(title)}"><i class="fa fa-crow"></i> ${utils.escapeHtml(v.category)}</span>`
    );
  }

  async function lookup(domains) {
    const now = Date.now();
    const missing = domains.filter(d => !cache.has(d) || now - cache.get(d).at > CACHE_MS);
    if (missing.length === 0) return;
    const r = await kestrel.api("/explain", { method: "POST", body: { domains: missing }, quiet: true });
    for (const d of missing) cache.set(d, { verdict: r[d] || null, at: now });
  }

  async function decorate(table) {
    const rows = table.rows({ page: "current" });
    const domains = [...new Set(rows.data().toArray().map(q => norm(q.domain)))].filter(Boolean);
    if (domains.length === 0) return;
    try {
      await lookup(domains);
    } catch {
      return; // engine off or unreachable: the query log works as before
    }

    rows.every(function () {
      const hit = cache.get(norm(this.data().domain));
      const cell = $("td:eq(3)", this.node());
      if (hit && hit.verdict && cell.find(".kp-ai").length === 0) cell.append(badge(hit.verdict));
    });
  }

  function ensureModal() {
    if (modal) return modal;
    modal = $(`
      <div class="modal fade" id="kp-ai-modal" tabindex="-1" role="dialog" aria-labelledby="kp-ai-title">
        <div class="modal-dialog" role="document"><div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title" id="kp-ai-title"></h4>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer"></div>
        </div></div>
      </div>`).appendTo("body");
    modal.on("click", "button[data-act]", async function () {
      const domain = $(this).data("domain");
      await kestrel.decide(domain, $(this).data("act"));
      cache.delete(domain);
      modal.modal("hide");
      $("#all-queries").DataTable().draw(false);
    });
    return modal;
  }

  function actions(v) {
    const d = utils.escapeHtml(v.domain);
    const b = (act, cls, icon, text) =>
      `<button type="button" class="btn btn-${cls}" data-act="${act}" data-domain="${d}"><i class="fa fa-${icon}"></i> ${text}</button>`;
    if (v.status === "pending") return b("approve", "danger", "ban", "Block") + b("reject", "default", "check", "Don't block");
    if (v.status === "blocked" || v.status === "user_blocked") return b("unblock", "success", "rotate-left", "Unblock");
    return b("block", "danger", "ban", "Block");
  }

  async function whyBlocked(domain) {
    const url = `${document.body.dataset.apiurl}/search/${encodeURIComponent(domain)}?N=20`;
    const r = await $.ajax({ url, method: "GET", dataType: "json" });
    const out = [];
    for (const e of r.search.domains || []) {
      if (e.type !== "deny") continue;
      const what = e.kind === "regex" ? "regex rule" : "deny-list entry";
      out.push(`${what} <code>${utils.escapeHtml(e.domain)}</code>${e.comment ? " (" + utils.escapeHtml(e.comment) + ")" : ""}`);
    }

    for (const g of r.search.gravity || []) {
      if (g.type !== "block") continue;
      out.push(`block list <code>${utils.escapeHtml(g.address)}</code>`);
    }

    return out;
  }

  async function open(domain) {
    const hit = cache.get(norm(domain));
    if (!hit || !hit.verdict) return;
    const v = hit.verdict;
    const m = ensureModal();
    m.find(".modal-title").html(`<i class="fa fa-crow"></i> AI review: <span class="kp-domain">${utils.escapeHtml(v.domain)}</span>`);
    const when = utils.datetime(v.judged_at, false, false);
    m.find(".modal-body").html(
      `<p>${kestrel.categoryLabel(v.category)} ${kestrel.statusLabel(v.status, v)} · ${kestrel.percent(v.confidence)} sure</p>` +
        `<p>${utils.escapeHtml(v.reason || "")}</p>` +
        `<p class="text-muted small">Judged by ${utils.escapeHtml(v.model || "an earlier version")} on ${when}.</p>` +
        '<div id="kp-ai-why"></div>'
    );
    m.find(".modal-footer").html(actions(v));
    m.modal("show");
    try {
      const why = await whyBlocked(v.domain);
      if (why.length > 0) {
        $("#kp-ai-why").html("<strong>Blocked by:</strong><ul><li>" + why.join("</li><li>") + "</li></ul>");
      }
    } catch {
      // The verdict is still useful without the list details.
    }
  }

  // Bound on the table body, like the query log's own row handler, so that jQuery runs this
  // (deeper) match first and stopPropagation() keeps the row's detail view closed.
  let bound = false;
  function bind(table) {
    if (bound) return;
    bound = true;
    $(table.table().body()).on("click keydown", ".kp-ai", function (event) {
      if (event.type === "keydown" && event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      open($(this).data("domain"));
    });
  }

  return {
    decorate(table) {
      bind(table);
      return decorate(table);
    },
  };
})();
