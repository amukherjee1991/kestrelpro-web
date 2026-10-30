<? --[[
*  KestrelPro: AI review overview.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>AI review</h1>
    <small>A model running on this network reviews every new domain your devices look up. Nothing is sent to the cloud.</small>
</div>

<p class="kp-statusline" id="kp-state">Loading…</p>

<div class="row">
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-aqua no-user-select">
            <div class="inner">
                <p>Reviewed, last 24 h</p>
                <h3 class="statistic"><span id="kp-reviewed">---</span></h3>
            </div>
            <div class="icon"><i class="fas fa-magnifying-glass"></i></div>
            <a href="<?=webhome?>kestrel/decisions?status=all" class="small-box-footer"><span id="kp-reviewed-total">-</span> reviewed in total <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-yellow no-user-select">
            <div class="inner">
                <p id="kp-second-label">Waiting for approval</p>
                <h3 class="statistic"><span id="kp-second">---</span></h3>
            </div>
            <div class="icon"><i class="fas fa-list-check"></i></div>
            <a href="<?=webhome?>kestrel/review" class="small-box-footer" id="kp-second-link">Review them <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-red no-user-select">
            <div class="inner">
                <p>Blocked by KestrelPro</p>
                <h3 class="statistic"><span id="kp-blocked">---</span></h3>
            </div>
            <div class="icon"><i class="fas fa-ban"></i></div>
            <a href="<?=webhome?>kestrel/decisions?status=blocked" class="small-box-footer"><span id="kp-blocked-today">-</span> in the last 24 h <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box kp-accent no-user-select">
            <div class="inner">
                <p>Model</p>
                <h3 class="statistic"><span id="kp-model-state">---</span></h3>
            </div>
            <div class="icon"><i class="fas fa-microchip"></i></div>
            <a href="<?=webhome?>kestrel/settings" class="small-box-footer"><span id="kp-model">-</span> <i class="fa fa-arrow-circle-right"></i></a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-5">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">What it has seen</h3>
            </div>
            <div class="box-body">
                <div class="kp-chart"><canvas id="kp-categories" aria-label="Domains reviewed and flagged, by category" role="img"></canvas></div>
            </div>
        </div>
    </div>
    <div class="col-md-7">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">Recently flagged</h3>
                <div class="box-tools pull-right"><a href="<?=webhome?>kestrel/decisions" class="btn btn-box-tool">See all</a></div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table table-hover" id="kp-recent">
                    <thead><tr><th>Domain</th><th>Category</th><th>Status</th><th class="hidden-xs kp-when">When</th></tr></thead>
                    <tbody><tr><td colspan="4" class="text-muted">Loading…</td></tr></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/overview.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
