<? --[[
*  KestrelPro: how often the model agrees with your own decisions.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Accuracy</h1>
    <small>Every <em>Block</em> and <em>Don't block</em> you click is a lesson. This page grades the model against your decisions, using today's threshold and categories.</small>
</div>

<div class="row">
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-aqua no-user-select">
            <div class="inner"><p>Your decisions</p><h3 class="statistic"><span id="kp-acc-n">---</span></h3></div>
            <div class="icon"><i class="fas fa-user-check" aria-hidden="true"></i></div>
            <a href="<?=webhome?>kestrel/history?what=all" class="small-box-footer">See them in History <i class="fa fa-arrow-circle-right" aria-hidden="true"></i></a>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-green no-user-select">
            <div class="inner"><p>Model agrees with you</p><h3 class="statistic"><span id="kp-acc-agree">---</span></h3></div>
            <div class="icon"><i class="fas fa-handshake" aria-hidden="true"></i></div>
            <span class="small-box-footer" id="kp-acc-agree-sub">&nbsp;</span>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-red no-user-select">
            <div class="inner"><p>Flags you overruled</p><h3 class="statistic"><span id="kp-acc-fp">---</span></h3></div>
            <div class="icon"><i class="fas fa-hand" aria-hidden="true"></i></div>
            <span class="small-box-footer" id="kp-acc-fp-sub">&nbsp;</span>
        </div>
    </div>
    <div class="col-lg-3 col-sm-6">
        <div class="small-box bg-yellow no-user-select">
            <div class="inner"><p>Missed (you blocked)</p><h3 class="statistic"><span id="kp-acc-fn">---</span></h3></div>
            <div class="icon"><i class="fas fa-eye-slash" aria-hidden="true"></i></div>
            <span class="small-box-footer">Domains the model let through</span>
        </div>
    </div>
</div>

<div id="kp-acc-empty" class="callout hidden">
    <p>No decisions yet. Approve or reject a few suggestions on <a href="<?=webhome?>kestrel/review">Needs approval</a> and they'll show up here.</p>
</div>

<div class="row">
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">By what the model said</h3></div>
            <div class="box-body table-responsive no-padding">
                <table class="table" id="kp-acc-cat"><thead><tr><th>Model said</th><th>Decisions</th><th>You blocked</th><th>Agreement</th></tr></thead><tbody></tbody></table>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border">
                <h3 class="box-title">By model</h3>
                <div class="box-tools pull-right"><a class="btn btn-box-tool" href="<?=webhome?>kestrel/models">Compare models</a></div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table" id="kp-acc-model"><thead><tr><th>Model</th><th>Decisions</th><th>Agreement</th><th>Right flags</th></tr></thead><tbody></tbody></table>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Where you and the model disagree</h3></div>
            <div class="box-body">
                <p class="text-muted" id="kp-acc-fewshot"></p>
                <div class="table-responsive">
                    <table class="table" id="kp-acc-dis"><thead><tr><th>Domain</th><th>Model said</th><th>You decided</th><th>Reason given</th><th class="kp-when">When</th></tr></thead><tbody></tbody></table>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/accuracy.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
