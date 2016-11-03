define(['moduleChart', 'nexus'], function (moduleChart, nexus) {

    var moduleData = (function(){
        // VARIABLES
        var treeData = null;
        var treeObject = null;
        var rangeSliderX, rangeSliderY;
        var bottomMargin = 250;
        var $phylogeneticTree = $('#phylogeneticTree');
        var $sliderX = $('#sliderX');
        var $sliderY = $('#sliderY');
        var $sliderN = $('#sliderN');
        var $sliderB = $('#sliderB');
        var $message = $('#message');
        var $messageClose = $('#message > button.close');
        var parseError = '';
        var $nodeInfoClose = $('#nodeInfo button.close')

        return {

            init: function() {

                $messageClose.on('click', function(e) {
                    $(this).parent().slideUp();
                });

                $nodeInfoClose.on('click', function(e) {
                    $('#nodeInfo').animate({'right': '-300px'}, 400);
                })

                /* Initialize range sliders */
                rangeSliderX = $sliderX.slider({
                    formatter: function(value) { return value; },
                    enabled: false
                });

                rangeSliderY = $sliderY.slider({
                    formatter: function(value) { return value; },
                    enabled: false
                });

                $sliderX.on('slideStop', moduleData.updateLayoutRange);
                $sliderY.on('slideStop', moduleData.updateLayoutRange);

                /* Set container height in accordance to window height */
                adjustHeight();

                $(window).on('resize', function(e) {
                    adjustHeight();
                })

                /* Chart Setup */
                var settings = {
                    linkLengthX: rangeSliderX.val(),
                    linkLengthY: rangeSliderY.val()
                }

                moduleChart.setup(settings);

                loadSharedChart();
            },

            updateLayoutRange: function(e) {

                var center = true;
                var settings = moduleChart.getSettings();

                switch (e.target.id) {
                    case 'sliderX':
                    settings.linkLengthX = e.value;
                    center = true;
                    break;
                    case 'sliderY':
                    settings.linkLengthY = e.value;
                    center = true;
                    break;
                }

                moduleChart.setup(settings);
                moduleChart.render(treeData, center); // false: Do not center the chart
            },

            /**
            * Updates the state of x-axis and y-axis range sliders to enabled or disabled based on the type of active layouts
            * @param string layout
            * @return
            */
            updateRangeSliderState: function(layout) {
                var settings = moduleChart.getSettings();
                rangeSliderX.slider('setAttribute', 'max', settings.linkLengthXMax);
                rangeSliderY.slider('setAttribute', 'max', settings.linkLengthYMax);
                rangeSliderX.slider('setValue', parseInt(settings.linkLengthX));
                rangeSliderY.slider('setValue', parseInt(settings.linkLengthY));
                switch(layout) {
                    case 'tree':
                    rangeSliderX.slider('enable');
                    rangeSliderY.slider('enable');
                    break;
                    case 'cluster':
                    rangeSliderX.slider('enable');
                    rangeSliderY.slider('enable');
                    break;
                    case 'radial-tree':
                    rangeSliderX.slider('enable');
                    rangeSliderY.slider('disable');
                    break;
                    case 'radial-cluster':
                    rangeSliderX.slider('enable');
                    rangeSliderY.slider('disable');
                    break;
                }

            },

            /**
            * Updates the message area with string data and appropriate style
            * @param string msg
            * @param string type : danger, warning, info, success || null
            */
            updateMessage: function(msg, type) {
                if(type) {
                    $message.find('.message-body').html(msg);
                    $message.attr('class', 'alert alert-dismissable').addClass('alert-'+type).slideDown();
                } else {
                    $message.find('.message-body').html(msg);
                    $message.attr('class', 'alert alert-dismissable').slideUp();
                }
                return false;
            },

            loadingStart: function() {
                $('.content > .row').block({
                    message: '<h4>Loading ...</h4><img src="/assets/img/spinner_2.gif">',
                    css: {
                        'border': 'none',
                        'background': 'transparent',
                        'color': '#505c66'
                    },
                    // styles for the overlay
                    overlayCSS:  {
                        backgroundColor: '#fff',
                        opacity:         0.3,
                        cursor:          'wait'
                    },
                });
            },

            loadingStop: function() {
                $('.content > .row').unblock();
            },
        }

        /**
        * Load data via ajax
        */
        function loadSharedChart() {

            moduleData.loadingStart();

            var shareData = null;
            if(SHARE_HASH == undefined && SHARE_HASH == '') {
                var msg = ['An error occured. Chart could not be loaded.', 'danger'];
                moduleData.updateMessage(msg[0], msg[1]);
                return;
            }
            var url = '/json/get-share/' + SHARE_HASH;

            $.ajax({
                url: url,
                type: 'GET',
                async: false,
            })
            .done(function(response) {
                var status = parseInt(response.status);
                switch (status) {
                    case 1:
                        shareData = response.share;
                        break;
                    default:
                        var msg = ['An error occured. Chart data is not availble and the chart could not be loaded.', 'danger'];
                        moduleData.updateMessage(msg[0], msg[1]);
                        return;
                    break;
                }
            })
            .fail(function() {
                var msg = ['An error occured. Chart could not be loaded.', 'danger'];
                moduleData.updateMessage(msg[0], msg[1]);
                return;
            });

            // Chart Data is available. Try to Load it
            var fileData = parseJson(shareData.data);
            if(fileData && fileData.tree !== undefined) {
                treeData = fileData.tree;
                var settings = fileData.settings;
                settings.chartTitle = shareData.title; //Set custom chart name
                moduleChart.setup(settings);
                moduleChart.init(treeData);
                moduleData.updateRangeSliderState(settings.activeLayout);
                moduleData.loadingStop();
                // moduleData.updateMessage('Tree data successfully loaded.', 'success');
            } else {
                var msg = ['Invalid file data. Chart could not be loaded.', 'danger'];
                moduleData.updateMessage(msg[0], msg[1]);
            }
        }

        /**
        * Parses json data and returns false if the json is incorectly formated
        * @param string data
        * @return string
        */
        function parseJson(data)
        {
            try {
                var parsedData = JSON.parse(data);
                // if came to here, then valid
                return parsedData;
            } catch(e) {
                // failed to parse
                return false;
            }
        }

        function adjustHeight()
        {
            $phylogeneticTree.css('height', $(window).height() - bottomMargin);
            var $svg = $phylogeneticTree.find('svg');
            if($svg.length > 0) {
                $svg.height( $phylogeneticTree.height() );
                $svg.width( $phylogeneticTree.width() );
            }
            $('#sliderVertical').css('height', $(window).height() - bottomMargin);
            $('#nodeInfo').css('height', $(window).height() - bottomMargin);
        }

        String.prototype.toProperCase = function () {
            return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
        };

    })();

    return moduleData;

});
