<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta name="csrf_token" content="{!! csrf_token(); !!}">
        <title>{{ isset($shareTitle) ? $shareTitle : 'Shared Chart'}}</title>
        @include('includes.styles')
    </head>
    <body class="skin-blue fixed">
        <!-- Site wrapper -->
        <div class="wrapper share">
            <!-- =============================================== -->
            {{-- <header class="main-header">
                <a href="{{ URL::to('/') }}" class="logo"><b>Phylogenetic</b>Tree</a>
            </header> --}}
            <!-- Content Wrapper. Contains page content -->
            <div class="content-wrapper">
                <!-- Content Header (Page header) -->
                {{-- <section class="content-header">
                    <h1>Phylogenetic Tree<small>An interactive web-based tree representation</small></h1>
                </section> --}}
                <!-- Main content -->
                <section class="content">
                    <!-- Message container -->
                    <div id="message" class="alert">
                        <button type="button" class="close" aria-hidden="true">&times;</button>
                        <div class="message-body"></div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <!-- MAP & BOX PANE -->
                            <div class="box chart-box">
                                <div class="box-header with-border">
                                    <h3 id="chartTitle" class="box-title">Chart</h3>
                                    <a href="#" id="viewChartDescription" title="Click for Chart Description"><i class="fa fa-info-circle"></i></a>
                                </div><!-- /.box-header -->
                                <!-- SLIDER Y -->
                                <div class="box-aside box-pane-right pad ">
                                    <input id="sliderY" class="slider " data-slider-id='sliderVertical' type="text" data-slider-min="0" data-slider-max="500" data-slider-step="1" data-slider-value="200" data-slider-orientation="vertical" />
                                </div>
                                <div class="box-body no-padding">
                                    <div class="row">
                                        <!-- CHART RENDER -->
                                        <div class="col-xs-12">
                                            <div class="pad">
                                                <!-- Chart will be created here -->
                                                <div id="phylogeneticTree" class="chart" style="height: auto;">
                                                    <div class="text-center">
                                                        <h4>Loading ....</h4>
                                                        <img src="/assets/img/spinner_2.gif" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div><!-- /.col -->
                                    </div><!-- /.row -->
                                </div><!-- /.box-body -->
                                <!-- SCALE -->
                                <div class="box-footer no-border no-padding">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div style="padding: 0px 15px 0px 30px">
                                                <div id="treeScale"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- SLIDER X -->
                                <div class="box-footer no-border no-padding">
                                    <div class="row margin">
                                        <div class="col-sm-12">
                                            <input id="sliderX" class="slider" data-slider-id='sliderHorizontal' type="text" data-slider-min="0" data-slider-max="5000" data-slider-step="1" data-slider-value="1000"/>
                                        </div>
                                    </div>
                                </div>
                                <!-- CHART STATS -->
                                <div class="box-footer">
                                    <div class="row">
                                        <div class="col-xs-4 text-center" style="border-right: 1px solid #f4f4f4">
                                            <div id="sparkline-1"></div>
                                            <!-- <div class="knob-label">DEPTH: 12</div> -->
                                            <div class="tree-depth">DEPTH : <span>--</span></div>
                                            <div class="color-depth"></div>
                                        </div><!-- ./col -->
                                        <div class="col-xs-4 text-center" style="border-right: 1px solid #f4f4f4">
                                            <div id="sparkline-2"></div>
                                            <div class="tree-nodes">TOTAL NODES : <span>--</span></div>
                                        </div><!-- ./col -->
                                        <div class="col-xs-4 text-center">
                                            <div id="sparkline-3"></div>
                                            <div class="tree-leaves">LEAVES : <span>--</span></div>
                                        </div><!-- ./col -->
                                    </div><!-- /.row -->
                                </div>
                            </div><!-- /.box -->
                        </div><!-- /.col -->
                    </div><!-- /.row -->
                    <!-- Node Info Panel -->
                    <div id="nodeInfo" class="">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <div class="info-content"></div>
                    </div>
                </section><!-- /.content -->
            </div><!-- /.content-wrapper -->

            @include('includes.footer')
        </div><!-- ./wrapper -->

        <!--Description Modal -->
        <div class="modal fade" id="chartDescriptionModal" tabindex="-1" role="dialog" aria-labelledby="chartDescriptionModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-light-blue">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title" id="chartDescriptionModalLabel"><i class="fa fa-info-circle"></i>Description</h4>
                    </div>
                    <div class="modal-body">
                        <p>
                            @if( $shareDescription )
                                {!! $shareDescription !!}
                            @else
                                No description is available for this chart.
                            @endif
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal" data-file="">Close</button>
                    </div>
                </div>
            </div>
        </div>


        @include('includes.scripts')
        <script type="text/javascript">
            var SHARE_HASH = '<?php echo $shareHash; ?>';
        </script>
        <!-- Phylogenetic Share Scripts -->
        <script data-main="/assets/js/share" src="/assets/plugins/require/require.js"></script>
        <script type="text/javascript">
            $(document).ready(function() {
                $('#viewChartDescription').on('click', function(event) {
                    event.preventDefault();
                    $('#chartDescriptionModal').modal();
                })
            });
        </script>
  </body>
</html>
