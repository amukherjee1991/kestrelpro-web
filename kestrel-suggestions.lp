<? --[[
*  KestrelPro: suggestions (block-list false positives, site-wide rules).
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Suggestions</h1>
    <small>Second opinions that go beyond one domain at a time. Nothing here changes until you click.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Possibly blocked by mistake</h3>
                <div class="box-tools pull-right"><span class="text-muted small" id="kp-sg-checks"></span></div>
            </div>
            <div class="box-body">
                <p class="text-muted">Your block lists are written by people who can't test every household. The model takes a second look at domains they block, most-requested first, and lists the ones that look like logins, CDNs or APIs. Allowing one adds it to your allow list.</p>
                <div class="table-responsive">
                    <table class="table" id="kp-sg-false">
                        <thead><tr><th>Domain</th><th>Model says</th><th>Devices</th><th>Blocked by</th><th></th></tr></thead>
                        <tbody><tr><td colspan="5" class="text-muted">Loading…</td></tr></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-7">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Block whole sites</h3></div>
            <div class="box-body">
                <p class="text-muted">When three or more domains of one site are blocked, one rule can cover the rest, including subdomains nobody has seen yet. That also catches parts of the site you might need, so check before you add one.</p>
                <div class="table-responsive">
                    <table class="table" id="kp-sg-sites">
                        <thead><tr><th>Site</th><th>Already blocked</th><th>Rule</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-5">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Site-wide rules in place</h3></div>
            <div class="box-body table-responsive no-padding">
                <table class="table" id="kp-sg-rules">
                    <thead><tr><th>Site</th><th>Rule</th><th class="kp-when">Added</th><th></th></tr></thead>
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/suggestions.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
