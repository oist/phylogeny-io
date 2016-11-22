@extends('master', array('bodyClass' => ' fixed '))

@section('title', 'Home | Phylogeny.IO')

@section('sidebar')
    @include('includes.toolbar')
    @include('includes.navigation')
@stop

@section('content')
    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
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
                                        <div id="phylogeneticTree" class="chart" style="height: auto;"></div>
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
                                    <!-- <div class="knob-label">DEPTH: 12</div> -->
                                    <div class="tree-depth">DEPTH : <span>--</span></div>
                                </div><!-- ./col -->
                                <div class="col-xs-4 text-center" style="border-right: 1px solid #f4f4f4">
                                    <div class="tree-nodes">TOTAL NODES : <span>--</span></div>
                                </div><!-- ./col -->
                                <div class="col-xs-4 text-center">
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

    <!-- MODALS -->
    @include('modals.json-save')
    @include('modals.share-chart')
    @include('modals.annotate')
    @include('modals.color-picker')
    @include('modals.font-select')
    @if(Session::get('phylo.visit_at') > \Carbon\Carbon::now()->subSeconds(9))
        @include('modals.welcome')
    @endif
@stop

@section('scripts')
    <!-- Phylogenetic Scripts -->
    <script data-main="/assets/js/main" src="/assets/plugins/require/require.js?version=1.0"></script>
    <script type="text/javascript">
        $(document).ready(function() {
            $('#welcomeModal').modal();
        });
    </script>
@stop
