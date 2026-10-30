<? --[[
*  KestrelPro: AI review settings.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>AI review settings</h1>
    <small>Changes apply straight away. They are stored by KestrelPro, separately from the DNS settings.</small>
</div>

<form id="kp-settings" class="kp-settings" autocomplete="off">
<div class="row">
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">When the model flags a domain</h3></div>
            <div class="box-body">
                <div>
                    <input type="radio" name="mode" id="kp-mode-review" value="review">
                    <label for="kp-mode-review"><strong>Review first</strong>: suggestions wait in <em>Needs approval</em> until you decide</label>
                </div>
                <div>
                    <input type="radio" name="mode" id="kp-mode-auto" value="auto">
                    <label for="kp-mode-auto"><strong>Automatic</strong>: block straight away (you can undo any block in History)</label>
                </div>
                <hr>
                <div class="form-group">
                    <label for="kp-confidence">Flag only when the model is at least <span id="kp-confidence-value">85</span>% sure</label>
                    <input type="range" id="kp-confidence" min="50" max="100" step="1">
                    <p class="help-block">Small models are often overconfident, so this filters less than you might expect. Review first is the safer way to start.</p>
                </div>
                <div class="form-group">
                    <label>Block these kinds of domain</label>
                    <div id="kp-categories"></div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Model and timing</h3></div>
            <div class="box-body">
                <div class="form-group">
                    <label for="kp-model">Model</label>
                    <input type="text" class="form-control" id="kp-model" placeholder="gemma4:12b">
                    <p class="help-block">Any Ollama model that supports structured JSON output. Pull it first: <code>ollama pull &lt;model&gt;</code>.</p>
                </div>
                <div>
                    <input type="radio" name="cadence" id="kp-cadence-realtime" value="realtime">
                    <label for="kp-cadence-realtime"><strong>Real time</strong>: new domains are judged within about 15 seconds</label>
                </div>
                <div>
                    <input type="radio" name="cadence" id="kp-cadence-eco" value="eco">
                    <label for="kp-cadence-eco"><strong>Eco</strong>: one pass every few minutes, for a slow or CPU-only model</label>
                </div>
                <div class="form-group kp-interval">
                    <label for="kp-interval">Minutes between passes in Eco mode</label>
                    <input type="number" id="kp-interval" min="1" max="1440" class="form-control">
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Never block</h3></div>
            <div class="box-body">
                <div class="form-group">
                    <label for="kp-protected">Your own list (one domain per line; subdomains are included)</label>
                    <textarea class="form-control" id="kp-protected" rows="5" placeholder="example.com"></textarea>
                </div>
                <details>
                    <summary>Built-in list (<span id="kp-builtin-count">0</span> domains: logins, updates, CDNs)</summary>
                    <ul class="kp-builtin" id="kp-builtin"></ul>
                </details>
            </div>
            <div class="box-footer">
                <button type="submit" class="btn btn-primary"><i class="fa fa-floppy-disk"></i> Save</button>
            </div>
        </div>
    </div>
</div>
</form>

<script src="<?=pihole.fileversion('scripts/js/kestrel/settings.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
