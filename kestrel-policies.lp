<? --[[
*  KestrelPro: per-device policies through the DNS server's groups.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Device policies</h1>
    <small>Give groups of devices their own rules, say Automatic for the kids' tablets and Review first for work laptops. Put devices in groups under <a href="<?=webhome?>groups/clients">Group Management → Clients</a>.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border"><h3 class="box-title">Groups</h3>
                <div class="box-tools pull-right"><a class="btn btn-box-tool" href="<?=webhome?>groups">Manage groups</a></div>
            </div>
            <div class="box-body table-responsive no-padding">
                <table class="table kp-policies" id="kp-policies">
                    <thead><tr><th>Group</th><th>Devices</th><th>When the model flags a domain</th><th>Threshold</th><th>Kinds of domain</th><th></th></tr></thead>
                    <tbody><tr><td colspan="6" class="text-muted">Loading…</td></tr></tbody>
                </table>
            </div>
            <div class="box-footer text-muted small">
                A device in several groups gets every applicable rule: if any of its groups blocks automatically, the
                block applies to that group's devices only; groups in Review first queue it for approval.
                Blocks you make or approve yourself apply to everyone.
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/policies.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
