<? --[[
*  KestrelPro: every decision, by status.
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Decisions</h1>
    <small>Every domain the model has reviewed. Undo any decision with one click; it is logged in History.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="nav-tabs-custom">
            <ul class="nav nav-tabs" id="kp-tabs">
                <li data-status="flagged"><a href="?status=flagged">Flagged</a></li>
                <li data-status="blocked"><a href="?status=blocked">Blocked</a></li>
                <li data-status="allowed"><a href="?status=allowed">Allowed</a></li>
                <li data-status="all"><a href="?status=all">Everything</a></li>
            </ul>
            <div class="tab-content">
                <form class="form-inline" id="kp-block-form" autocomplete="off">
                    <div class="form-group">
                        <label class="sr-only" for="kp-block-domain">Domain to block</label>
                        <input type="text" class="form-control" id="kp-block-domain" placeholder="Block a domain, e.g. ads.example.com" size="36">
                    </div>
                    <button type="submit" class="btn btn-danger"><i class="fa fa-ban"></i> Block</button>
                </form>
                <br>
                <table id="kp-table" class="table table-striped table-bordered" width="100%" data-mode="decisions"></table>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/decisions.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
