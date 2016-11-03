<!-- Font Select Modal -->
<div class="modal fade" id="fontSelectModal" tabindex="-1" role="dialog" aria-labelledby="fontSelectModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-light-blue">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="colorPickerModalLabel"><i class="fa fa-font"></i>Select a font ...</h4>
            </div>
            <div class="modal-body">
                <div id="fontSelect">
                    <form class="form form-inline" action="" method="post">
                        <label for="" class="control-label">Font family:&nbsp; &nbsp;</label>
                        <select class="form-control" id="fontApplySelect">
                            <option value='Georgia, serif'>Georgia, serif</option>
                            <option value='"Palatino Linotype", "Book Antiqua", Palatino, serif'>"Palatino Linotype", "Book Antiqua", Palatino, serif</option>
                            <option value='"Times New Roman", Times, serif'>"Times New Roman", Times, serif</option>
                            <option value='Arial, Helvetica, sans-serif'>Arial, Helvetica, sans-serif</option>
                            <option value='"Arial Black", Gadget, sans-serif'>"Arial Black", Gadget, sans-serif</option>
                            <option value='"Comic Sans MS", cursive, sans-serif'>"Comic Sans MS", cursive, sans-serif</option>
                            <option value='Impact, Charcoal, sans-serif'>Impact, Charcoal, sans-serif</option>
                            <option value='"Lucida Sans Unicode", "Lucida Grande", sans-serif'>"Lucida Sans Unicode", "Lucida Grande", sans-serif</option>
                            <option value='Tahoma, Geneva, sans-serif'>Tahoma, Geneva, sans-serif</option>
                            <option value='"Trebuchet MS", Helvetica, sans-serif'>"Trebuchet MS", Helvetica, sans-serif</option>
                            <option value='Verdana, Geneva, sans-serif'>Verdana, Geneva, sans-serif</option>
                            <option value='"Courier New", Courier, monospace'>"Courier New", Courier, monospace</option>
                            <option value='"Lucida Console", Monaco, monospace'>"Lucida Console", Monaco, monospace</option>
                        </select>
                    </form>
                </div>
            </div>
            <div class="modal-footer">
                <button id="fontApplyBtn" type="submit" class="btn btn-primary" data-menu="">Apply</button>
                <button type="button" class="btn btn-default" data-dismiss="modal" data-file="">Close</button>
            </div>
        </div>
    </div>
</div>
