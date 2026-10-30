<? --[[
*  KestrelPro: about, origin and licence notice.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>About KestrelPro</h1>
</div>

<div class="row">
    <div class="col-md-8">
        <div class="box">
            <div class="box-body">
                <img class="kp-about-logo" src="<?=webhome?>img/logo.svg" alt="" width="72" height="72">
                <p><strong>KestrelPro</strong> blocks ads, trackers and malicious domains for your whole network
                at the DNS level, and asks a language model running on your own hardware for a second opinion
                on every new domain your devices look up. Nothing is sent to the cloud.</p>
                <p style="clear:both">KestrelPro is a modified version of <strong>Pi-hole&reg;</strong> software,
                used under the European Union Public Licence (EUPL) v1.2. Pi-hole is a registered trademark of
                Pi-hole, LLC. KestrelPro is not affiliated with or endorsed by Pi-hole, LLC.</p>
                <p>The admin interface and the container build were modified by the KestrelPro project,
                starting 2026-10-29: the AI review pages, the review engine, and removal of Pi-hole branding.
                The DNS server (FTL) is the unmodified upstream release. Every change to upstream files is
                marked <code>kestrelpro:begin</code> / <code>kestrelpro:end</code> in the source and listed in
                <code>KESTRELPRO-CHANGES.md</code>.</p>
                <p>If you find the DNS blocking useful, consider supporting the upstream project:
                <a href="https://pi-hole.net/donate/" rel="noopener noreferrer" target="_blank">pi-hole.net/donate</a>.</p>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">This installation</h3></div>
            <div class="box-body">
                <dl>
                    <dt>Review engine</dt><dd id="kp-about-engine">checking…</dd>
                    <dt>Prompt version</dt><dd id="kp-about-prompt">–</dd>
                    <dt>Licence</dt><dd>EUPL-1.2 (<a href="https://interoperable-europe.ec.europa.eu/collection/eupl/eupl-text-eupl-12" rel="noopener noreferrer" target="_blank">text</a>)</dd>
                </dl>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/about.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
