<!-- DATA LOADER -->
<li class="header">LOAD THE DATA</li>
<div class="upload-file">
    <form id="upload" action="#" method="POST">
        <input type="hidden" id="MAX_FILE_SIZE" name="MAX_FILE_SIZE" value="300000" />
        <div>
            <input type="file" id="fileSelect" name="fileSelect" style="display: inline-block; visibility: hidden;" />
            <div id="filedrag">
                <div id="filedrag-body">
                    <div>Load your data with Newick, Nexus or .json file.</div>
                    <div><small>Drag and drop here,<br/>or <a id="fileSelectLink" href="#">manually upload.</a></small></div>
                </div>
            </div>
        </div>
        <div id="uploadButton">
            <button type="submit">Upload File</button>
        </div>
    </form>
</div><!-- /.upload-file -->
<div id="jsonSaveDiv" class="hidden text-center">
    <button id="jsonSaveBtn" class="btn btn-sm btn-primary"><i class="fa fa-floppy-o"></i>Save JSON</button>
    <button id="shareChartBtn" class="btn btn-sm btn-success"><i class="fa fa-share-alt"></i>Share chart</button>
</div>
<!-- END of DATA LOADER -->

<!-- LOAD DEMO EXAMPLES -->
<li class="header">EXAMPLE</li>
<li><a href="#" class="example" data-file="ant_tree.json"><i class="fa fa-file-text-o"></i>&nbsp;Ant Tree</a></li>

<li class="header">TOOLBAR</li>
<!-- MENU: Layout -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-connectdevelop"></i>
        <span>Layout</span>
        <i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="layout">
        <li><a href="#" data-item="tree"><i class="fa fa-circle-o"></i>&nbsp;Phylogram</a></li>
        <li><a href="#" data-item="cluster"><i class="fa fa-circle-o"></i>&nbsp;Cladogram</a></li>
        <li><a href="#" data-item="radial-tree"><i class="fa fa-circle-o"></i>&nbsp;Polar Phylogram</a></li>
        <li><a href="#" data-item="radial-cluster"><i class="fa fa-circle-o"></i>&nbsp;Polar Cladogram</a></li>
        <hr/>
        <!-- <li class="subheader">DISPLAY</li> -->
        <!-- Node and Link size -->
        <li class="nb-slider"><label>Node Radius (relative)</label></li>
        <li>
            <input id="sliderN" class="slider " data-slider-id='sliderNode' type="text" data-slider-min="0" data-slider-max="40" data-slider-step="1" data-slider-value="3" data-slider-orientation="horizontal" />
        </li>
        <li class="nb-slider"><label>Branch Width (px)</label></li>
        <li>
            <input id="sliderB" class="slider " data-slider-id='sliderBranch' type="text" data-slider-min="0" data-slider-max="60" data-slider-step="1" data-slider-value="4" data-slider-orientation="horizontal" />
        </li>
    </ul>
</li>
<!-- END of MENU: Layout -->
<!-- MENU: Misc. -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-wrench"></i><span>Misc.</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="misc">
        <li class="subheader">SELECTION</li>
        <li><a href="#" data-item="branch"><i class="fa fa-minus"></i>&nbsp;Branch</a></li>
        <li><a href="#" data-item="clade"><i class="fa fa-bars"></i>&nbsp;Clade</a></li>
        <li><a href="#" data-item="taxa"><i class="fa fa-ellipsis-v"></i>&nbsp;Taxa</a></li>
        <li class="subheader">ACTIONS</li>
        <li><a href="#" class="single" data-item="color"><i class="fa fa-eyedropper"></i>&nbsp;Color<div class="color-status selection-color"></div></a></li>
        <li><a href="#" class="single" data-item="rotate"><i class="fa fa-refresh"></i>&nbsp;Rotate</a></li>
        <li><a href="#" class="single" data-item="sort" data-sort="down"><i class="fa fa-arrow-down"></i>&nbsp;Sort</a></li>
        <li><a href="#" class="single" data-item="annotate"><i class="fa fa-sticky-note-o"></i>&nbsp;Annotate</a></li>
    </ul>
</li>
<!-- END of MENU: Misc. -->
<!-- MENU: Tip Labels -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-leaf"></i><span>Tip Labels</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="tip-labels">
        <form class="form-horizontal tip-labels">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Display:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-all" data-action="display">
                        <option value="0" selected="selected">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color By:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-single" data-action="colorby">
                        <option value="0" selected="selected">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #1:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorstart" data-color="#fff"><i class="fa fa-eyedropper"></i>&nbsp;Start</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #2:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorend" data-color="#fff"><i class="fa fa-eyedropper"></i>&nbsp;End</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Font:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="fontsize">
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-default btn-xs" data-action="fontfamily" data-selected=""><i class="fa fa-font"></i></button>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Format:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm" data-action="format">
                        <option value="decimal" selected="selected">Decimal</option>
                        <option value="scientific">Scientific</option>
                        <option value="percent">Percent</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Sig. Digits:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="4" data-action="sigdigits">
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Tip Labels -->
<!-- MENU: Node Labels -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-bookmark-o"></i><span>Node Labels</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="node-labels">
        <form class="form-horizontal node-labels">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Display:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-all" data-action="display">
                        <option value="0" selected="selected">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color By:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-single" data-action="colorby">
                        <option value="0" selected="selected">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #1:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorstart"><i class="fa fa-eyedropper"></i>&nbsp;Start</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #2:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorend"><i class="fa fa-eyedropper"></i>&nbsp;End</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Font:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="fontsize">
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-default btn-xs" data-action="fontfamily" data-selected=""><i class="fa fa-font"></i></button>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Format:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm" data-action="format">
                        <option value="decimal" selected="selected">Decimal</option>
                        <option value="scientific">Scientific</option>
                        <option value="percent">Percent</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Sig. Digits:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="4" data-action="sigdigits">
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Node Labels -->
<!-- MENU: Node Shapes -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-circle-thin"></i><span>Node Shapes</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="node-shapes">
        <form class="form-horizontal node-shapes">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Shape:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm" data-action="shape">
                        <option value="circle">Circle</option>
                        <option value="rectangle">Rectangle</option>
                        <option value="diamond">Diamond</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Size By:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm nexus-single" data-action="sizeby">
                        <option value="0">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Min. Size:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="minsize">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Max. Size:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="maxsize">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color By:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-single" data-action="colorby">
                        <option value="0">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #1:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorstart"><i class="fa fa-eyedropper"></i>&nbsp;Start</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #2:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorend"><i class="fa fa-eyedropper"></i>&nbsp;End</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Annotation:</label>
                <div class="col-sm-7">
                    <input type="checkbox" data-action="annotation">
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Node Shapes -->
<!-- MENU: Node Bars -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-bar-chart"></i><span>Node Bars</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="node-bars">
        <form class="form-horizontal node-bars">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Display:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-all" data-action="display">
                        <option value="0">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Bar Width:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="5" data-action="barwidth">
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Node Bars -->
<!-- MENU: Branch Labels -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-sitemap"></i><span>Branch Labels</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="branch-labels">
        <form class="form-horizontal branch-labels">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Display:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-all" data-action="display">
                        <option value="0">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color By:</label>
                <div class="col-sm-7">
                    <select id="" class="form-control input-sm nexus-single" data-action="colorby">
                        <option value="0">No attributes</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #1:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorstart"><i class="fa fa-eyedropper"></i>&nbsp;Start</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Color #2:</label>
                <div class="col-sm-7">
                    <button type="button" class="btn btn-default btn-xs" data-action="colorend"><i class="fa fa-eyedropper"></i>&nbsp;End</button>
                    <div class="color-status"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Font:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="fontsize">
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-default btn-xs" data-action="fontfamily" data-selected=""><i class="fa fa-font"></i></button>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Format:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm" data-action="format">
                        <option value="decimal" selected="selected">Decimal</option>
                        <option value="scientific">Scientific</option>
                        <option value="percent">Percent</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Sig. Digits:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="4" data-action="sigdigits">
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Branch Labels -->
<!-- MENU: Branch Projection -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-random"></i><span>Branch Projection</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="branch-projection">
        <form class="form-horizontal branch-projection">
            <div class="form-group">
                <label class="col-sm-5">Projection:</label>
                <div class="col-sm-7">
                    <select class="form-control input-sm" data-action="projection">
                        <option value="elbow" selected="selected">Elbow</option>
                        <option value="diagonal">Diagonal</option>
                        <option value="direct">Direct</option>
                    </select>
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Node Bars -->
<!-- MENU: Scale Bar -->
<li class="treeview">
    <a href="#">
        <i class="fa fa-arrows-h"></i><span>Scale Bar</span><i class="fa fa-angle-left pull-right"></i>
    </a>
    <ul class="treeview-menu" data-menu="scale-bar">
        <form class="form-horizontal scale-bar">
            <div class="form-group">
                <label class="col-sm-5">Show/Hide:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="showhide">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Automatic:</label>
                <div class="col-sm-7">
                    <input type="checkbox" checked="checked" data-action="automatic">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Scale:</label>
                <div class="col-sm-5">
                    <input type="text" class="form-control input-sm spinner" value="1" data-action="scale">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Line:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="5" data-action="lineweight">
                </div>
            </div>
            <div class="form-group">
                <label class="col-sm-5">Font:</label>
                <div class="col-sm-4">
                    <input type="text" class="form-control input-sm spinner" value="10" data-action="fontsize">
                </div>
                <div class="col-sm-3">
                    <button type="button" class="btn btn-default btn-xs" data-action="fontfamily" data-selected=""><i class="fa fa-font"></i></button>
                </div>
            </div>
        </form>
    </ul>
</li>
<!-- END of MENU: Scale Bar -->
