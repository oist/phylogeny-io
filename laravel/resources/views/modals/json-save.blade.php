<!-- Json Save Modal -->
<div class="modal fade" id="jsonSaveModal" tabindex="-1" role="dialog" aria-labelledby="jsonSaveModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-light-blue">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="jsonSaveModalLabel"><i class="fa fa-floppy-o"></i>Save a file to your computer</h4>
            </div>
            <div class="modal-body">
                <div id="jsonUrl"></div>
            </div>
            <div class="modal-footer">
                <input id="jsonFile" type="hidden" value="">
                <button id="jsonDownloadBtn" type="button" class="btn btn-primary">Download</button>
                <button id="jsonDelete" type="button" class="btn btn-default" data-dismiss="modal" data-file="">Close</button>
            </div>
        </div>
    </div>
</div>
