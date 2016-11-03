
"use strict";

$(function () {

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf_token"]').attr('content')
        }
    });

    /**
    * Todo list. Check/uncheck as solved
    */
    $('.todo-list').on('click', 'input[type="checkbox"]', function() {
        var $that = $(this);
        var id = $that.data('id');
        var solved = $that.is(':checked') ? '1' : '0';
        $.ajax({
            url: '/admin/ajax/solve-issue',
            type: 'POST',
            data: {id: id, solved: solved}
        })
        .done(function(response) {
            var status = parseInt(response.status);
            switch (status) {
                case 1:
                if(solved == '1') {
                    $that.parents('li').addClass('done');
                } else {
                    $that.parents('li').removeClass('done');
                }
                break;
                case 2:
                alert(response.message);
                break;
                default:
                break;
            }
        })
        .fail(function() {
            console.log("error");
        });
    });

    /**
    * Todo list - previous and next pagination fix
    */
    $('.pagination').on('click', 'li.previous a, li.next a', function(event) {
        event.preventDefault();
        var $that = $(this);
        var current = $that.data('current');
        var html = "";
        var activeBtn = $('.pagination li.active');
        var page = $(activeBtn).find('a').data('page');
        if($that.parent().hasClass('previous')) {
            var prevBtn = $(activeBtn).prev('li:not(.previous)');
            if(prevBtn.length > 0) {
                $(prevBtn).find('a').trigger('click');
            } else {
                if(page > 1) {
                    var btns = $('.pagination li:not(.previous, .next) a');
                    $.each(btns, function(index, el) {
                        var decrement = parseInt($(el).data('page')) - 1;
                        $(el).html(decrement);
                        $(el).data('page', decrement);
                        $(el).attr('data-page', decrement);
                    });
                    $('.pagination li.active a').trigger('click');
                }
            }
        } else {
            var last = $that.data('last');
            var nextBtn = $(activeBtn).next('li:not(.next)');
            if(nextBtn.length > 0) {
                $(nextBtn).find('a').trigger('click');
            } else {
                if(page < last) {
                    var btns = $('.pagination li:not(.previous, .next) a');
                    $.each(btns, function(index, el) {
                        var increment = parseInt($(el).data('page')) + 1;
                        $(el).html(increment);
                        $(el).data('page', increment);
                        $(el).attr('data-page', increment);
                    });
                    $('.pagination li.active a').trigger('click');
                }
            }
        }
    });

    /**
    * Todo list - pagination
    */
    $('.pagination li:not(.previous,.next) a').on('click', function(event) {
        event.preventDefault();
        var $that = $(this);
        var page = $(this).data('page');

        $.ajax({
            url: '/admin/ajax/issues',
            type: 'GET',
            data: {
                'page' : page
            },
            beforeSend: function() {
                loadingStart('#boxIssues .loading');
            },
            complete: function() {
                loadingStop('#boxIssues .loading');
            }
        })
        .done(function(response) {
            var parsed = $.parseJSON(response);
            var html = '';
            $.each(parsed.data, function(index, el) {
                if(el.solved) {
                    var solved = ' done ';
                    var checked = ' checked ';
                } else {
                    var solved = '';
                    var checked = '';
                }
                html += "<li class="+solved+">";
                html += "<input type='checkbox' value='1' name='solved' "+checked+" data-id='"+el.id+"'/>";
                html += "<span class='text'>Issue #"+el.id+" - "+el.title+"</span>";
                switch (el.urgency) {
                    case 'high':
                    html += "<small class='label label-danger'><i class='fa fa-exclamation-triangle'></i>"+el.urgency+"</small>";
                    break;
                    case 'medium':
                    html += "<small class='label label-warning'><i class='fa fa-rocket'></i>"+el.urgency+"</small>";
                    break;
                    case 'low':
                    html += "<small class='label label-default'><i class='fa fa-clock-o'></i>"+el.urgency+"</small>";
                    break;
                    default:
                    html += "<small class='label label-danger'><i class='fa fa-exclamation-triangle'></i>"+el.urgency+"</small>";
                    break;
                }
                html += "<div class='tools'><a href='/admin/feedbacks/edit/"+el.id+"'><i class='fa fa-edit'></i></a></div>";
                html += "</li>";
            });
            $('#boxIssues .todo-list').html(html);
            $('#boxIssues .pagination li').removeClass('active');
            $('#boxIssues .pagination li a[data-page='+page+']').parent().not('.next, .previous').addClass('active');
            // $('#boxIssues .pagination li.previous a, #boxIssues .pagination li.next a').data('current', page);
        })
        .fail(function() {
            console.log("error");
        })

    })
    //Make the dashboard widgets sortable Using jquery UI
    $(".connectedSortable").sortable({
        placeholder: "sort-highlight",
        connectWith: ".connectedSortable",
        handle: ".box-header, .nav-tabs",
        forcePlaceholderSize: true,
        zIndex: 999999
    });

    $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");

    //Sparkline charts
    var myvalues = [1000, 1200, 920, 927, 931, 1027, 819, 930, 1021];
    $('#sparkline-1').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });
    myvalues = [515, 519, 520, 522, 652, 810, 370, 627, 319, 630, 921];
    $('#sparkline-2').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });
    myvalues = [15, 19, 20, 22, 33, 27, 31, 27, 19, 30, 21];
    $('#sparkline-3').sparkline(myvalues, {
        type: 'line',
        lineColor: '#92c1dc',
        fillColor: "#ebf4f9",
        height: '50',
        width: '80'
    });

    //SLIMSCROLL FOR CHAT WIDGET
    $('#chat-box').slimScroll({
        height: '250px'
    });

    /**
    * Time stats chart
    */
    $.ajax({
        url: '/admin/ajax/time-stats',
        type: 'GET',
        beforeSend: function() {
            loadingStart('#boxTimeStats .loading');
        },
        complete: function() {
            loadingStop('#boxTimeStats .loading');
        }
    })
    .done(function(response) {
        var data = response.data;
        var ykeys = response.ykeys.reverse();
        var labels = response.labels.reverse();
        var lineColors = ['#00c0ef', '#00a65a', "#605ca8"].reverse();
        /* Morris.js Charts */
        // Time Stats chart
        var area = new Morris.Area({
            element: 'time-stats-chart',
            resize: true,
            data: data,
            xkey: 'y',
            xLabels: 'month',
            ykeys: ykeys,
            labels: labels,
            lineColors: lineColors,
            hideHover: 'auto'
        });
    })
    .fail(function() {
        console.log("error");
    });


    //-------------
    //- PIE CHART -
    //-------------
    // Get context with jQuery - using jQuery's .get() method.
    var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
    var pieChart = new Chart(pieChartCanvas);
    $.ajax({
        url: '/admin/ajax/browsers',
        type: 'GET',
        beforeSend: function() {
            loadingStart('#boxBrowser .loading');
        },
        complete: function() {
            loadingStop('#boxBrowser .loading');
        }
    })
    .done(function(response) {
        var PieData = response.browsers;
        // var PieData = response;
        var pieOptions = {
            //Boolean - Whether we should show a stroke on each segment
            segmentShowStroke: true,
            //String - The colour of each segment stroke
            segmentStrokeColor: "#fff",
            //Number - The width of each segment stroke
            segmentStrokeWidth: 1,
            //Number - The percentage of the chart that we cut out of the middle
            percentageInnerCutout: 50, // This is 0 for Pie charts
            //Number - Amount of animation steps
            animationSteps: 100,
            //String - Animation easing effect
            animationEasing: "easeOutBounce",
            //Boolean - Whether we animate the rotation of the Doughnut
            animateRotate: true,
            //Boolean - Whether we animate scaling the Doughnut from the centre
            animateScale: false,
            //Boolean - whether to make the chart responsive to window resizing
            responsive: true,
            // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
            maintainAspectRatio: false,
            //String - A legend template
            legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>",
            //String - A tooltip template
            tooltipTemplate: "<%=value %> <%=label%> users"
        };
        //Create pie or douhnut chart
        // You can switch between pie and douhnut using the method below.
        pieChart.Doughnut(PieData, pieOptions);
        $.each( response.browsers, function(index, browser) {
            $('.chart-legend li i[data-browser='+browser.label+']').css('color', browser.color);
        });
    })
    .fail(function() {
        console.log("error");
    });


    /* jVector Maps
    * ------------
    * Create a world map with markers
    */
    $.ajax({
        url: '/admin/ajax/vectormap-locations',
        type: 'GET',
        beforeSend: function() {
            loadingStart('#boxMap .loading');
        },
        complete: function() {
            loadingStop('#boxMap .loading');
        }
    })
    .done(function(response) {
        var visits = response.visits;
        var shares = response.shares;
        var visitMarkers = null;
        if(visits.length > 0) {
            visitMarkers = [];
            $.each(visits, function(index, el) {
                if(el.city == null || el.city == 'null' || el.city == undefined) {
                    var location = el.country;
                } else {
                    var location = el.city + ' ('+el.country+')';
                }
                if(parseInt(el.share) == 0) {
                    visitMarkers.push({ latLng: [parseInt(el.lat), parseInt(el.lon)], name: location, style: {fill: '#00c0ef'} });
                } else {
                    visitMarkers.push({ latLng: [parseInt(el.lat), parseInt(el.lon)], name: location, style: {fill: '#605ca8'} });
                }
            });
        }
        if(shares.length > 0) {
            $.each(shares, function(index, el) {
                if(el.city == null || el.city == 'null' || el.city == undefined) {
                    var location = el.country;
                } else {
                    var location = el.city + ' ('+el.country+')';
                }
                visitMarkers.push({ latLng: [parseInt(el.lat), parseInt(el.lon)], name: location, style: {fill: '#00a65a'} });
            });
        }
        // Initialize Map
        visitorLocationMap(visitMarkers);
    })
    .fail(function() {
        console.log("error");
    });

    function visitorLocationMap(markers) {
        $('#world-map-markers').vectorMap({
            map: 'world_mill_en',
            normalizeFunction: 'polynomial',
            hoverOpacity: 0.7,
            hoverColor: false,
            backgroundColor: 'transparent',
            regionStyle: {
                initial: {
                    fill: 'rgba(210, 214, 222, 1)',
                    "fill-opacity": 1,
                    stroke: 'none',
                    "stroke-width": 0,
                    "stroke-opacity": 1
                },
                hover: {
                    "fill-opacity": 0.7,
                    cursor: 'pointer'
                },
                selected: {
                    fill: 'yellow'
                },
                selectedHover: {
                }
            },
            markerStyle: {
                initial: {
                    fill: '#00a65a',
                    stroke: '#333',
                    'stroke-width': 0
                }
            },
            markers: markers
        });

    }

    /* SPARKLINE CHARTS
    * ----------------
    * Create a inline charts with spark line
    */

    //-----------------
    //- SPARKLINE BAR -
    //-----------------
    $('.sparkbar').each(function () {
        var $this = $(this);
        $this.sparkline('html', {
            type: 'bar',
            height: $this.data('height') ? $this.data('height') : '30',
            barColor: $this.data('color')
        });
    });

    //-----------------
    //- SPARKLINE PIE -
    //-----------------
    $('.sparkpie').each(function () {
        var $this = $(this);
        $this.sparkline('html', {
            type: 'pie',
            height: $this.data('height') ? $this.data('height') : '90',
            sliceColors: $this.data('color')
        });
    });

    //------------------
    //- SPARKLINE LINE -
    //------------------
    $('.sparkline').each(function () {
        var $this = $(this);
        $this.sparkline('html', {
            type: 'line',
            height: $this.data('height') ? $this.data('height') : '90',
            width: '100%',
            lineColor: $this.data('linecolor'),
            fillColor: $this.data('fillcolor'),
            spotColor: $this.data('spotcolor')
        });
    });

    function loadingStart(el) {
        $(el).block({
            message: '<img src="/assets/img/spinner_2.gif" />',
            css: {
                'border': 'none',
                'background': 'transparent',
                'color': '#505c66'
            },
            // styles for the overlay
            overlayCSS:  {
                backgroundColor: '#fff',
                opacity:         0.8,
                cursor:          'wait'
            },
        });
    }

    function loadingStop(el) {
        $(el).unblock();
    }

});
