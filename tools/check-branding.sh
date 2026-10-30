#!/usr/bin/env bash
# KestrelPro: fail if any Pi-hole mark is left in the user-visible admin UI.
# Allowed: copyright/licence headers and origin notes ("a modified version of Pi-hole ..."), kestrel-about.lp (origin statement), vendor/,
# lowercase identifiers and URLs (pihole, pi-hole.net), lines marked kestrelpro:keep.
#
# This file is copyright under the latest version of the EUPL.
set -euo pipefail
cd "$(dirname "$0")/.."
fail=0

mapfile -t files < <(git ls-files '*.lp' 'scripts/js/*.js' 'scripts/js/**/*.js' 'img/favicons/manifest.json' \
    | grep -v -e '^vendor/' -e '^kestrel-about\.lp$' | sort -u)
if hits=$(grep -n -E 'Pi-hole|Pi-<(strong|b)>hole|P<strong>h</strong>' "${files[@]}" \
          | grep -v -E 'Pi-hole: A black hole|Pi-hole, LLC|modified version of Pi-hole|kestrelpro:keep'); then
    echo "Pi-hole name in user-visible text:"
    echo "${hits}"
    fail=1
fi

# Donation links belong on the About page only, where they are clearly for the upstream project.
if hits=$(grep -n 'pi-hole\.net/donate' "${files[@]}"); then
    echo "Pi-hole donate link outside the About page:"
    echo "${hits}"
    fail=1
fi

# Pi-hole's logo colours (red/green teardrop) must not be in any image we ship.
if hits=$(grep -l -i -E '#?(96060c|f60d1a|22b225|29fc2e)' img/*.svg img/favicons/*.svg 2>/dev/null); then
    echo "Pi-hole logo colours in: ${hits}"
    fail=1
fi
for f in logo.svg logo-bw.svg; do
    cmp -s "img/$f" "tools/brand/$f" || { echo "img/$f is not the KestrelPro logo"; fail=1; }
done

if [ "${fail}" -eq 0 ]; then echo "branding check passed"; fi
exit "${fail}"
