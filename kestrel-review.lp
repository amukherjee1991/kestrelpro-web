<? --[[
*  KestrelPro: suggestions waiting for approval (Review first mode).
*  Part of KestrelPro, a modified version of Pi-hole's web interface.
*  This file is copyright under the latest version of the EUPL.
*  Please see LICENSE file for your rights under this license.
]]--
mg.include('scripts/lua/header_authenticated.lp','r')
mg.include('scripts/lua/kestrel_common.lp','r')
?>
<div class="page-header">
    <h1>Needs approval</h1>
    <small>In <em>Review first</em> mode, domains the model wants to block wait here. Nothing is blocked until you say so.</small>
</div>

<div class="row">
    <div class="col-md-12">
        <div class="box" id="kp-list-box">
            <div class="box-header with-border">
                <h3 class="box-title">Suggested blocks</h3>
                <div class="box-tools pull-right">
                    <button type="button" class="btn btn-danger btn-sm" id="kp-approve-all" disabled><i class="fa fa-ban"></i> Block all</button>
                </div>
            </div>
            <div class="box-body">
                <table id="kp-table" class="table table-striped table-bordered" width="100%" data-mode="review"></table>
            </div>
        </div>
    </div>
</div>

<script src="<?=pihole.fileversion('scripts/js/kestrel/decisions.js')?>"></script>
<? mg.include('scripts/lua/footer.lp','r')?>
