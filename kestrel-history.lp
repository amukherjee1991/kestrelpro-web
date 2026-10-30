<? --[[
*  KestrelPro: history of every block and unblock.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>History</h1>
    <small>Every block, approval and undo, with the devices that looked the domain up.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box">
            <div class="box-header with-border">
                <form class="form-inline kp-filters" id="kp-filters">
                    <div class="form-group">
                        <label for="kp-what">Show</label>
                        <select class="form-control input-sm" id="kp-what">
                            <option value="blocks">Blocks</option>
                            <option value="auto">Automatic only</option>
                            <option value="flagged">Flagged for approval</option>
                            <option value="undone">Undone</option>
                            <option value="all">Everything</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="kp-network">Devices</label>
                        <select class="form-control input-sm" id="kp-network">
                            <option value="">All devices</option>
                            <option value="home">Home network</option>
                            <option value="vpn">VPN</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="kp-days">Period</label>
                        <select class="form-control input-sm" id="kp-days">
                            <option value="1">Last 24 hours</option>
                            <option value="7" selected>Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="0">All time</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="box-body">
                <div class="row kp-summary">
                    <div class="col-sm-4 col-xs-4"><div class="description-block border-right"><h5 class="description-header" id="kp-sum-blocked">–</h5><span class="description-text">Blocked</span></div></div>
                    <div class="col-sm-4 col-xs-4"><div class="description-block border-right"><h5 class="description-header" id="kp-sum-auto">–</h5><span class="description-text">Automatically</span></div></div>
                    <div class="col-sm-4 col-xs-4"><div class="description-block"><h5 class="description-header" id="kp-sum-undone">–</h5><span class="description-text">Undone</span></div></div>
                </div>
                <br>
                <table id="kp-history" class="table table-striped table-bordered" width="100%"></table>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/history.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
