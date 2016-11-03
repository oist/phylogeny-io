<!-- Annotate Node Modal -->
<div class="modal fade" id="annotateNodeModal" tabindex="-1" role="dialog" aria-labelledby="annotateNodeModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-light-blue">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="annotateNodeModalLabel"><i class="fa fa-sticky-note-o"></i>Annotate Node</h4>
            </div>
            <div class="modal-body">
                <form id="annotateNodeForm">
                    <div class="form-group">
                        <label for="nodeAddInfo">Node Info:</label>
                        <textarea id="nodeAddInfo" class="form-control" name="node_info" placeholder="Additional info ..." rows="8" cols="40" style="font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px;"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="nodeImage">Node Image:</label>
                        <input id="nodeImage" class="form-control" name="node_url" placeholder="Image url ... "/>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button id="annotateSaveBtn" type="button" class="btn btn-primary" data-node="">Save</button>
                <button type="button" class="btn btn-default" data-dismiss="modal" data-file="">Close</button>
            </div>
        </div>
    </div>
</div>
