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
                    <div id="kp-categories">
                        <div><input type="checkbox" name="category" id="kp-cat-ads" value="ads"><label for="kp-cat-ads">Ads</label></div>
                        <div><input type="checkbox" name="category" id="kp-cat-tracking" value="tracking"><label for="kp-cat-tracking">Tracking and analytics</label></div>
                        <div><input type="checkbox" name="category" id="kp-cat-telemetry" value="telemetry"><label for="kp-cat-telemetry">Product telemetry</label></div>
                        <div><input type="checkbox" name="category" id="kp-cat-malicious" value="malicious"><label for="kp-cat-malicious">Malware, phishing and scams</label></div>
                    </div>
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
                    <input type="text" class="form-control" id="kp-model" placeholder="gemma4:12b" readonly>
                    <p class="help-block">Change it on the <a href="<?=webhome?>kestrel/models">Models</a> page, which also downloads, pins and benchmarks models.</p>
                </div>
                <div>
                    <input type="checkbox" id="kp-few-shot">
                    <label for="kp-few-shot"><strong>Learn from my decisions</strong>: show the model a few of your recent Block / Don't block choices as examples</label>
                </div>
                <hr>
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
            <div class="box-header with-border"><h3 class="box-title">Safety net for automatic blocks</h3></div>
            <div class="box-body">
                <p>A new automatic block is on trial for a while. During the trial it is withdrawn, and the
                domain goes back to <em>Needs approval</em>, if you unblock another domain of the same site
                or if several devices keep retrying it (a sign that something broke).</p>
                <div class="row">
                    <div class="col-sm-4 form-group">
                        <label for="kp-probation">Trial period (hours, 0 = off)</label>
                        <input type="number" class="form-control" id="kp-probation" min="0" max="336">
                    </div>
                    <div class="col-sm-4 form-group">
                        <label for="kp-storm-devices">Devices retrying</label>
                        <input type="number" class="form-control" id="kp-storm-devices" min="1" max="100">
                    </div>
                    <div class="col-sm-4 form-group">
                        <label for="kp-storm-lookups">Blocked lookups each, within 5 minutes</label>
                        <input type="number" class="form-control" id="kp-storm-lookups" min="3" max="10000">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row">
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Second looks at your block lists</h3></div>
            <div class="box-body">
                <div class="form-group">
                    <label for="kp-list-checks">Blocked domains to re-check per hour (0 = off)</label>
                    <input type="number" class="form-control" id="kp-list-checks" min="0" max="600">
                    <p class="help-block">Only while the model has nothing else to do. Ones that look legitimate show up under <a href="<?=webhome?>kestrel/suggestions">Suggestions</a>.</p>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-6">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Notifications</h3></div>
            <div class="box-body">
                <p class="help-block">Off until you enter an address. Notifications include domain names and go to the address you enter; nothing else leaves your network.</p>
                <div class="row">
                    <div class="col-sm-4 form-group">
                        <label for="kp-notify-kind">Send to</label>
                        <select class="form-control" id="kp-notify-kind">
                            <option value="ntfy">ntfy topic</option>
                            <option value="webhook">Webhook (JSON)</option>
                        </select>
                    </div>
                    <div class="col-sm-8 form-group">
                        <label for="kp-notify-url">Address</label>
                        <input type="url" class="form-control" id="kp-notify-url" placeholder="https://ntfy.sh/your-private-topic…" spellcheck="false" autocomplete="off">
                    </div>
                </div>
                <label>Tell me when</label>
                <div><input type="checkbox" name="notify-event" id="kp-ne-auto" value="auto_blocked"><label for="kp-ne-auto">a domain is blocked automatically</label></div>
                <div><input type="checkbox" name="notify-event" id="kp-ne-pending" value="pending"><label for="kp-ne-pending">approvals pile up (at most once a day)</label></div>
                <div><input type="checkbox" name="notify-event" id="kp-ne-trial" value="probation_reverted"><label for="kp-ne-trial">a trial block is withdrawn</label></div>
                <div><input type="checkbox" name="notify-event" id="kp-ne-list" value="list_false_positive"><label for="kp-ne-list">a block list seems to block something legitimate</label></div>
                <div class="form-group kp-interval">
                    <label for="kp-notify-pending">"Pile up" means at least</label>
                    <input type="number" class="form-control" id="kp-notify-pending" min="1" max="10000">
                </div>
                <button type="button" class="btn btn-default btn-sm" id="kp-notify-test"><i class="fa fa-paper-plane" aria-hidden="true"></i> Send Test</button>
                <span class="text-muted small">Save first; messages are combined and sent at most every 5 minutes.</span>
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
