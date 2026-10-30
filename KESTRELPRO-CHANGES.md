# KestrelPro changes to the web interface

This is a modified version of Pi-hole's web interface (EUPL-1.2). The changes below were
made by the KestrelPro project. Changed lines in upstream files are marked
`kestrelpro:begin` / `kestrelpro:end`, except for the debranding commit, which is generated
by `tools/debrand.sh`. The original copyright and licence notices are unchanged.

## 2026-10-29: kestrelpro/v6.6.1-k0 (based on upstream v6.6.1)

- New pages: `kestrel.lp` (AI review), `kestrel-review.lp` (Needs approval),
  `kestrel-decisions.lp`, `kestrel-history.lp`, `kestrel-settings.lp`, `kestrel-about.lp`,
  with `scripts/lua/kestrel_common.lp`, `scripts/js/kestrel/*.js` and `style/kestrel.css`.
  They call the KestrelPro engine with the admin interface's own session.
- `scripts/lua/sidebar.lp`: a "KestrelPro" menu section (one marked block).
- Debranding (`tools/debrand.sh`, checked by `tools/check-branding.sh`): KestrelPro logo
  and favicons; the Pi-hole name replaced in titles, menus and help text; links to
  Pi-hole's website, forum, GitHub and donation page replaced by the About page, which
  states the origin of the software and links to the upstream donation page.

## Branch model

`kestrelpro/<upstream-tag>-kN` = upstream tag + KestrelPro commits + one generated
"debrand" commit on top. To move to a new upstream tag: rebase the KestrelPro commits
onto it (dropping the old debrand commit), run `tools/debrand.sh`, run
`tools/check-branding.sh`, and commit the result as the new debrand commit.

## 2026-10-29: P5, safety net and Query Log verdicts

- New page `kestrel-broke.lp` ("Something broke?"): the KestrelPro blocks one device ran
  into recently, with Unblock and "Never block" (unblock and add to the Never block list).
- AI review page: Pause / Resume all KestrelPro blocks; "on trial" labels for fresh
  automatic blocks; a banner on every KestrelPro page while paused.
- AI settings: trial period and retry-storm thresholds.
- `queries.lp` and `scripts/js/queries.js` (one marked block each): the Query Log shows
  an AI badge on domains KestrelPro has judged; clicking it shows the verdict, which list
  or rule blocked the domain, and one-click actions (`scripts/js/kestrel/querylog.js`).

## 2026-10-29: Modern skin

- `style/kestrelpro.css` and `style/kestrelpro-dark.css` (new): a modern skin for the
  default themes (light, dark, darker, auto): neutral surfaces, KestrelPro's rust as the
  single accent, soft tinted badges, stat tiles as cards, rounded inputs and buttons,
  visible keyboard focus, press feedback, and a short dialog entrance (none under
  reduced motion). LCARS and the high-contrast themes are untouched.
- `scripts/lua/header.lp` (one marked block): loads the skin after the active theme,
  with the dark tokens for the dark themes or, for "auto", when the system is dark.
- Query Log: the AI badge is now a real `<button>` (keyboard and screen readers).

## 2026-10-30: Repository housekeeping

- Removed upstream's `.github/` (CI workflows, scheduled stale bots, dependabot, issue
  templates, CODEOWNERS) and `CONTRIBUTING.md`: they automate the upstream project, not this one.
- `README.md` replaced with a KestrelPro one. `LICENSE` is unchanged.
