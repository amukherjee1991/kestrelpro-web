#!/usr/bin/env bash
# KestrelPro: remove Pi-hole marks from the user-visible admin UI.
#
# Pi-hole's trademark rules forbid redistributing the software with its marks (name in
# titles and text, logos, favicons). This script applies every substitution in one go and
# is safe to run repeatedly. After rebasing the KestrelPro patches onto a new upstream tag,
# drop the previous "debrand" commit, run this script, check with tools/check-branding.sh,
# and commit the result as a fresh "debrand" commit at the top of the series.
#
# Kept on purpose: copyright and licence headers (EUPL Art. 5), the origin statement on
# kestrel-about.lp, links to upstream documentation, and internal identifiers such as the
# `pihole` command, pihole-FTL and /etc/pihole.
#
# This file is copyright under the latest version of the EUPL.
set -euo pipefail
cd "$(dirname "$0")/.."

brand=tools/brand
for f in logo.svg logo-bw.svg; do cp "$brand/$f" "img/$f"; done
for f in android-chrome-192x192.png android-chrome-512x512.png apple-touch-icon.png favicon-16x16.png \
         favicon-32x32.png favicon.ico mstile-150x150.png safari-pinned-tab.svg; do
    cp "$brand/$f" "img/favicons/$f"
done

# --- targeted edits (each a no-op once applied) -------------------------------------------
# Wordmarks
perl -i -pe 's{<span class="logo-mini">P<strong>h</strong></span>}{<span class="logo-mini">K<strong>P</strong></span>};
             s{<span class="logo-lg">Pi-<strong>hole</strong></span>}{<span class="logo-lg">Kestrel<strong>Pro</strong></span>};
             s{>\s*Open Source Ad Blocker\s*<}{>DNS blocking with an AI second opinion<}' scripts/lua/header_authenticated.lp
perl -0 -i -pe 's{(<span class="logo-mini">K<strong>P</strong></span>)}{$1}' scripts/lua/header_authenticated.lp
perl -0 -i -pe 's{Open Source Ad Blocker}{DNS blocking with an AI second opinion}g' scripts/lua/header_authenticated.lp
perl -i -pe 's{<span class="logo-lg" style="font-size: 25px;">Pi-<b>hole</b></span>}{<span class="logo-lg" style="font-size: 25px;">Kestrel<b>Pro</b></span>}' login.lp

# The new logo is square
perl -i -pe 's{(img/logo\.svg" alt="[^"]*" width="60") height="87"}{$1 height="60"}' scripts/lua/sidebar.lp
perl -i -pe 's{(class="loginpage-logo" width="140") height="202"}{$1 height="140"}' login.lp

# Header menu: links to Pi-hole's own website, forum, GitHub and releases become "About".
perl -0 -i -pe 's{\s*<a class="btn-link" href="https://pi-hole\.net/"[^>]*>.*?</a>}{\n                                <a class="btn-link" href="<?=webhome?>kestrel/about"><i class="fa-fw menu-icon fa-solid fa-circle-info"></i> About KestrelPro</a>}s;
                  s{\s*<a class="btn-link" href="https://discourse\.pi-hole\.net/[^"]*"[^>]*>.*?</a>}{}sg;
                  s{\s*<a class="btn-link" href="https://github\.com/pi-hole"[^>]*>.*?</a>}{}s' scripts/lua/header_authenticated.lp

# Login page: drop the forum and GitHub buttons
perl -0 -i -pe 's{\s*<a class="btn btn-default btn-sm" role="button" href="https://github\.com/pi-hole/"[^>]*>.*?</a>}{}s;
                  s{\s*<a class="btn btn-default btn-sm" role="button" href="https://discourse\.pi-hole\.net/"[^>]*>.*?</a>}{}s' login.lp

# Sidebar and footer: "Donate" (to Pi-hole) becomes "About", which credits and links upstream.
perl -0 -i -pe 's{<li class="header text-uppercase">Donate</li>\s*<li class="menu-donate">.*?</li>}{<li class="header text-uppercase">About</li>
                <li class="menu-kestrel<? if scriptname == \x27kestrel/about\x27 then ?> active<? end ?>">
                    <a href="<?=webhome?>kestrel/about">
                        <i class="fa fa-fw menu-icon fa-circle-info"></i> <span>About KestrelPro</span>
                    </a>
                </li>}s' scripts/lua/sidebar.lp
perl -0 -i -pe 's{<strong><a href="https://pi-hole\.net/donate/"[^>]*>.*?</a></strong> if you found this useful\.}{<a href="<?=webhome?>kestrel/about">About KestrelPro</a>}s' scripts/lua/footer.lp

# --- remaining prose -----------------------------------------------------------------------
# "your Pi-hole", "the Pi-hole DHCP server", page titles, the web app manifest ...
mapfile -t files < <(git ls-files '*.lp' 'scripts/js/*.js' 'img/favicons/manifest.json' \
    | grep -v -e '^vendor/' -e '^kestrel-about\.lp$')
perl -i -pe 'next if /Pi-hole: A black hole|Pi-hole, LLC|modified version of Pi-hole|kestrelpro:keep/;
             s/\bPi-holes\b/KestrelPro servers/g;
             s/Pi-hole/KestrelPro/g' "${files[@]}"

echo "debranded ${#files[@]} files; now run tools/check-branding.sh"
