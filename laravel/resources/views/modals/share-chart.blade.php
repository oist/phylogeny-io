<!-- Share Chart Modal -->
<div class="modal fade" id="shareChartModal" tabindex="-1" role="dialog" aria-labelledby="shareChartModalLabel" aria-hidden="true" data-backdrop="static" data-keyboard="false">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-light-blue">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="shareChartModalLabel"><i class="fa fa-share-alt"></i>Share Your Chart</h4>
            </div>
            <div class="modal-body">
                <p>Lorem ipsum dolor sit amet, quam metus turpis, ligula non suspendisse. Sollicitudin mattis odio libero imperdiet rutrum, congue eu amet sit aliquam volutpat, nec nullam ut vel lorem. Lorem nonummy, massa porta venenatis leo. Sodales amet. Ad malesuada est, odio vel elit quam, suscipit in porttitor purus at bibendum nascetur. Dui eu, nisl lacus mollis erat vestibulum accumsan id, consequat lectus eu diam ligula dui, nibh scelerisque ut in sollicitudin, tortor erat amet. Nunc etiam consectetuer, vestibulum vitae, malesuada eget nullam non a.</p>
                <div id="shareMessages" class="alert"></div>
                <form id="shareChartForm" class="form-horizontal">
                    <div class="form-group">
                        <label for="chartTitle" class="control-label col-sm-4">Chart Title:*</label>
                        <div class="col-sm-6">
                            <input type="text" id="chartTitle" class="form-control" name="chart_title">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="chartDescription" class="control-label col-sm-4">Chart Description:</label>
                        <div class="col-sm-6">
                            <textarea id="chartDescription" class="form-control" name="chart_description"  rows="3" style="font-size: 14px; line-height: 18px; border: 1px solid #dddddd; padding: 10px; height: 100px"></textarea>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="frameWidth" class="control-label col-sm-4">Frame Width x Height (px):</label>
                        <div class="col-sm-2">
                            <input type="text" id="frameWidth" class="form-control" name="frame_width">
                        </div>
                        <div class="col-sm-2">
                            <input type="text" id="frameHeight" class="form-control" name="frame_height" >
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="urlLifetimeSelect" class="control-label col-sm-4">Link Lifetime:</label>
                        <div class="col-sm-4">
                            <select id="urlLifetimeSelect" class="form-control" name="chart_lifetime">
                                <option value="day">A day</option>
                                <option value="week">A week</option>
                                <option value="month" selected>A month</option>
                                <option value="half-year">Six months</option>
                                <option value="yeah">A year</option>
                                <option value="infinity">Indefinite</option>
                            </select>
                        </div>
                    </div>
                    <div id="indefiniteMsg" class="alert bg-danger">
                        <i class="fa fa-exclamation-triangle"></i>&nbsp;&nbsp;Beware that even the urls with indefinite lifetime will be deleted if they were inactive for the past six months.
                    </div>
                    <div id="shareChartUrl" class="form-group">
                        <label for="urlShareInput" class="control-label col-sm-4">Share Chart:</label>
                        <div class="col-sm-7">
                            <textarea id="urlShareInput" type="text" name="url_share" cols="3" readonly></textarea>
                            <button id="copyCodeBtn" data-clipboard-target="#urlShareInput" type="button" class="btn btn-primary"><i class="fa fa-files-o"></i>Copy Code</button>
                            <a href="" id="gotoUrlShareBtn" target="_blank" class="btn btn-success"><i class="fa fa-hand-o-up"></i>View Link</a>
                        </div>
                    </div>
                    <input type="hidden" name="update" value="0">
                    <input type="hidden" name="hash" value="">
                </form>
            </div>
            <div class="modal-footer">
                <button id="urlShareBtn" type="button" class="btn btn-success">Generate Link</button>
                <button id="updateShareBtn" type="button" class="btn btn-primary">Update Chart</button>
                <button type="button" class="btn btn-default" data-dismiss="modal" data-file="">Close</button>
            </div>
        </div>
    </div>
</div>
