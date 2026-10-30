# KestrelPro web interface

The admin web interface of [KestrelPro](https://github.com/amukherjee1991/kestrelpro): DNS
blocking with an AI second opinion. Build and run instructions are in the main repository.

This is a modified version of Pi-hole's web interface, used under the European Union Public
Licence v1.2 (see `LICENSE`). Pi-hole is a registered trademark of Pi-hole, LLC; KestrelPro is
not affiliated with or endorsed by Pi-hole, LLC. Every change is listed in
[KESTRELPRO-CHANGES.md](KESTRELPRO-CHANGES.md), with the branch and rebase procedure.

- Branch `kestrelpro/<upstream-tag>-kN`: the upstream tag, KestrelPro's commits, and one
  generated "debrand" commit on top (`tools/debrand.sh`, checked by `tools/check-branding.sh`).
- The upstream history is kept on purpose: it is what lets the KestrelPro commits be rebased
  onto each new upstream release.
