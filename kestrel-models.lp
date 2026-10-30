<? --[[
*  KestrelPro: model management (installed models, pull, choose and pin, benchmark).
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Models</h1>
    <small>The language models on your model server. Choosing one pins its exact build, so a later download can't change its behaviour without you noticing.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Installed</h3></div>
            <div class="box-body table-responsive no-padding">
                <table class="table" id="kp-models">
                    <thead><tr><th>Model</th><th>Size</th><th>Build</th><th>Status</th><th></th></tr></thead>
                    <tbody><tr><td colspan="5" class="text-muted">Loading…</td></tr></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-5">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Download a model</h3></div>
            <div class="box-body">
                <form id="kp-pull-form" class="form-inline" autocomplete="off">
                    <div class="form-group">
                        <label class="sr-only" for="kp-pull-name">Model name</label>
                        <input type="text" class="form-control" id="kp-pull-name" placeholder="e.g. gemma4:12b…" spellcheck="false" size="24">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa fa-download" aria-hidden="true"></i> Download</button>
                </form>
                <p class="help-block">Any model from the Ollama library that supports structured JSON output. A 12B model is about 8&nbsp;GB and needs about 8&nbsp;GB of graphics memory to run fast.</p>
                <div id="kp-pulls" aria-live="polite"></div>
            </div>
        </div>
    </div>
    <div class="col-md-7">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Benchmarks</h3></div>
            <div class="box-body">
                <p class="text-muted">A benchmark asks a model about the domains you've already decided on and grades it against your decisions, with today's threshold and categories.</p>
                <div id="kp-bench-running" aria-live="polite"></div>
                <div class="table-responsive">
                    <table class="table" id="kp-benchmarks">
                        <thead><tr><th>Model</th><th>Agreement</th><th>Overruled flags</th><th>Missed</th><th>Time</th><th class="kp-when">When</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/models.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
