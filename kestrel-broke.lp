<? --[[
*  KestrelPro: "something broke on this device" - KestrelPro blocks one device ran into.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Something broke?</h1>
    <small>Pick the device that's misbehaving. You'll see every block KestrelPro added that it ran into, busiest first, and can undo them in one click.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border">
                <form class="form-inline kp-filters" id="kp-broke-form">
                    <div class="form-group">
                        <label for="kp-device">Device</label>
                        <select class="form-control input-sm" id="kp-device"><option value="">Loading devices…</option></select>
                    </div>
                    <div class="form-group">
                        <label for="kp-minutes">In the last</label>
                        <select class="form-control input-sm" id="kp-minutes">
                            <option value="10">10 minutes</option>
                            <option value="30" selected>30 minutes</option>
                            <option value="60">hour</option>
                            <option value="240">4 hours</option>
                            <option value="1440">24 hours</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="box-body">
                <p id="kp-broke-summary" class="text-muted">Choose a device.</p>
                <div class="table-responsive">
                    <table class="table table-striped table-bordered" id="kp-broke" width="100%">
                        <thead><tr><th>Domain</th><th>Blocked lookups</th><th>Last</th><th>Category</th><th>Why it was blocked</th><th>Status</th><th></th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/broke.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
