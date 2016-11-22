define(['moduleChart', 'nexus'], function (moduleChart, nexus) {

    var moduleData = (function(){
        // SELECTION VARIABLES
        var treeData = null;
        var treeObject = null;
        var rangeSliderX, rangeSliderY;
        var bottomMargin = 290;
        /* DOM Selector Vars */
        var $fileSelect = $('#fileSelect');
        var $fileDrag = $('#filedrag');
        var $phylogeneticTree = $('#phylogeneticTree');
        var $menuItem = $('ul.treeview-menu li a');
        var $menuInput = $('ul.treeview-menu form input, ul.treeview-menu form select');
        var $menuButton = $('ul.treeview-menu form button, ul.treeview-menu form a');
        var $sliderX = $('#sliderX');
        var $sliderY = $('#sliderY');
        var $sliderN = $('#sliderN');
        var $sliderB = $('#sliderB');
        var $message = $('#message');
        var $fileSelectlink = $('#fileSelectLink');
        var $jsonSaveDiv = $('#jsonSaveDiv');
        var $jsonSaveBtn = $('#jsonSaveBtn');
        var $shareChartBtn = $('#shareChartBtn');
        var $jsonSaveModal = $('#jsonSaveModal');
        var $shareChartModal = $('#shareChartModal');
        var $urlLifetimeSelect = $('#urlLifetimeSelect');
        var $urlShareBtn = $('#urlShareBtn');
        var $updateShareBtn = $('#updateShareBtn');
        var $colorPickerModal = $('#colorPickerModal');
        var $fontSelectModal = $('#fontSelectModal');
        var $annotateNodeModal = $('#annotateNodeModal');
        var $colorPicker = $("#colorPicker");
        var $colorApplyBtn = $('#colorApplyBtn');
        var $fontApplyBtn = $('#fontApplyBtn');
        var $annotateSaveBtn = $('#annotateSaveBtn');
        var $jsonFile = $('#jsonFile');
        var $jsonUrl = $('#jsonUrl');
        var $jsonDownloadBtn = $('#jsonDownloadBtn');
        var $messageClose = $('#message > button.close');
        var parseError = '';
        var $nodeInfoClose = $('#nodeInfo button.close')

        /* LOADING EXAMPLES */
        function loadExamples() {
            var $example = $('.example');
            $example.on('click', function(e) {
                e.preventDefault();
                that = this;
                moduleData.loadingStart();
                var exampleId = $(that).data('id');
                var filename = $(that).data('file');
                var extension = filename.split('.').pop();
                var baseUrl = window.location.origin;
                var url = baseUrl + '/assets/examples/' + filename;
                var fileContent = $.ajax({type: "GET", url: url, async: false}).responseText;


                switch(extension) {
                    // File is newick format - test and load if valid
                    case 'nwk':
                    case 'txt':
                    treeData = parseNewick(fileContent);
                    if(treeData) {
                        moduleChart.init(treeData);
                        moduleData.showToolbar();
                        var msg = ['Tree data successfully loaded.', 'success'];
                    } else {
                        var msg = ['Invalid file data.\nPlease load data in standard Newick notation.', 'danger'];
                    }
                    break;
                    // File is nexus format - test and load if valid
                    case 'nex':
                    case 'nxs':
                    case 'tree':
                    case 'tre':
                    var nexusNewick = parseNexus(fileContent);
                    var nexusNewickRaw = parseNexusRaw(fileContent);
                    if(nexusNewick) {
                        // Try to parse nexus meta data
                        treeData = nexusNewickRaw ? parseNewickRaw(nexusNewickRaw) : false;
                        if(treeData) {
                            moduleChart.init(treeData);
                            moduleData.showToolbar();
                            var msg = ['Tree data successfully loaded.', 'success'];
                        } else {
                            // Nexus parse of meta data failed, go for standard parsing
                            treeData = parseNewick(nexusNewick);
                            if(treeData) {
                                moduleChart.init(treeData);
                                moduleData.showToolbar();
                                moduleData.loadingStop();
                                var msg = ['There was an error in parsing additional tree data. Only basic tree data is displayed. ' + moduleData.parseError, 'warning'];
                                console.log(moduleData.parseError);
                            } else {
                                var msg = ['Invalid file data.\nPlease load Nexus file containing tree structure in valid format.', 'danger'];
                            }
                        }
                    } else {
                        // Not a nexus file, but try to parse it as Newick file anyway
                        treeData = parseNewick(fileContent);
                        if(treeData) {
                            moduleChart.init(treeData);
                            moduleData.showToolbar();
                            var msg = ['Tree data successfully loaded.', 'success'];
                        } else {
                            var msg = ['Invalid file data.\nPlease load Nexus file containing tree structure in valid format.', 'danger'];
                        }
                    }
                    moduleData.updateMessage(msg[0], msg[1]);
                    break;
                    // File is json format - test and load if valid
                    case 'json':
                    case 'js':
                    var fileData = parseJson(fileContent);
                    if(fileData && fileData.tree !== undefined) {
                        treeData = fileData.tree;
                        var settings = fileData.settings;
                        moduleChart.setup(settings);
                        moduleChart.init(treeData);
                        moduleData.showToolbar();
                        var msg = ['Tree data successfully loaded.', 'success'];
                    } else {
                        var msg = ['Invalid file data.\nPlease load json file exported with Phylogenetic Web app.', 'danger'];
                    }
                    break;
                    // Show general file-not-supported error
                    default:
                    var msg = ['File not supported.\nWe detected file extension that is not supported by this application. Please provide valid data in newick, nexus or json tree notation.', 'danger'];
                    break;
                }

                moduleData.loadingStop();
                moduleData.updateMessage(msg[0], msg[1]);
                $('a.example').parent().removeClass('active');
                $(that).parent().addClass('active');
            })
        }

        function fileDragHover(e)
        {
            e.stopPropagation();
            e.preventDefault();
            e.target.className = (e.type == "dragover" ? $fileDrag.addClass( "hover" ) : $fileDrag.removeClass( "hover" ));
        }

        function fileSelectHandler(e)
        {
            // cancel event and hover styling
            fileDragHover(e);
            // fetch FileList object
            var files = e.target.files || e.originalEvent.dataTransfer.files;
            // process all File objects
            for (var i = 0, f; f = files[i]; i++) {
                parseFile(f);
            }
        }

        function menuItemHandler(e, menuItem)
        {
            e.preventDefault();
            // If data is not loaded the menu toolbar will not do anything
            if(!treeData) return;
            $menuItem = $(menuItem);
            var $parentLi = $menuItem.closest('li');
            var $parentUl = $menuItem.closest('ul');
            if( !$menuItem.hasClass('single') ) {
                $parentUl.find('li').not('.single').removeClass('selected');
                $parentLi.addClass('selected');
            }
            var item = $menuItem.data('item');
            var menu = $parentUl.data('menu');
            moduleData.menuItemAction(menu, item);
        }

        function parseFile(file)
        {
            moduleData.loadingStart();
            var fileReader = new FileReader();
            fileReader.onload = function(e) {
                var filename = file.name;
                var extension = filename.split('.').pop();
                var fileContent = $.trim(e.target.result);

                switch(extension) {
                    // File is newick format - test and load if valid
                    case 'nwk':
                    case 'txt':
                    treeData = parseNewick(fileContent);
                    if(treeData) {
                        moduleChart.init(treeData);
                        moduleData.showToolbar();
                        moduleData.loadingStop();
                        moduleData.updateMessage('Tree data successfully loaded.', 'success');
                    } else {
                        var msg = 'Invalid file data.\nPlease load data in standard Newick notation.';
                        moduleData.updateMessage(msg, 'danger');
                    }
                    break;
                    // File is nexus format - test and load if valid
                    case 'nex':
                    case 'nxs':
                    case 'tree':
                    case 'tre':
                    var nexusNewick = parseNexus(fileContent);
                    var nexusNewickRaw = parseNexusRaw(fileContent);
                    if(nexusNewick) {
                        // Try to parse nexus meta data
                        treeData = nexusNewickRaw ? parseNewickRaw(nexusNewickRaw) : false;
                        if(treeData) {
                            moduleChart.init(treeData);
                            moduleData.showToolbar();
                            moduleData.loadingStop();
                            var msg = ['Tree data successfully loaded.', 'success'];
                        } else {
                            // Nexus parse of meta data failed, go for standard parsing
                            treeData = parseNewick(nexusNewick);
                            if(treeData) {
                                moduleChart.init(treeData);
                                moduleData.showToolbar();
                                moduleData.loadingStop();
                                var msg = ['There was an error in parsing additional tree data. Only basic tree data is displayed. ' + moduleData.parseError, 'warning'];
                                console.log(moduleData.parseError);
                            } else {
                                var msg = ['Invalid file data.\nPlease load Nexus file containing tree structure in valid format.', 'danger'];
                            }
                        }
                    } else {
                        // Not a nexus file, but try to parse it as Newick file anyway
                        treeData = parseNewick(fileContent);
                        if(treeData) {
                            moduleChart.init(treeData);
                            moduleData.showToolbar();
                            moduleData.loadingStop();
                            var msg = ['Tree data successfully loaded.', 'success'];
                        } else {
                            var msg = ['Invalid file data.\nPlease load Nexus file containing tree structure in valid format.', 'danger'];
                        }
                    }
                    moduleData.updateMessage(msg[0], msg[1]);
                    break;
                    // File is json format - test and load if valid
                    case 'json':
                    case 'js':
                    var fileData = parseJson(fileContent);
                    if(fileData && fileData.tree !== undefined) {
                        treeData = fileData.tree;
                        var settings = fileData.settings;
                        moduleChart.setup(settings);
                        moduleChart.init(treeData);
                        moduleData.showToolbar();
                        moduleData.loadingStop();
                        moduleData.updateMessage('Tree data successfully loaded.', 'success');
                    } else {
                        var msg = 'Invalid file data.\nPlease load json file exported with Phylogenetic Web app.';
                        moduleData.updateMessage(msg, 'danger');
                    }
                    break;
                    // Show general file-not-supported error
                    default:
                    var msg = 'File not supported.\nWe detected file extension that is not supported by this application. Please provide valid data in newick, nexus or json tree notation.';
                    moduleData.updateMessage(msg, 'danger');
                    break;
                }
            }
            fileReader.readAsText(file);
        }

        /**
        * Parse text content formated from Newick format to OO tree structure
        * @param string txt
        * @return object
        */
        function parseNewick(txt)
        {
            var ancestors = [];
            var tree = {};
            try {
                var tokens = txt.split(/\s*(;|\(|\)|,|:)\s*/);
                for (var i=0; i<tokens.length; i++) {
                    var token = tokens[i];
                    switch (token) {
                        case '(': // new children
                        var subtree = {};
                        tree.children = [subtree];
                        ancestors.push(tree);
                        tree = subtree;
                        break;
                        case ',': // another branch
                        var subtree = {};
                        ancestors[ancestors.length-1].children.push(subtree);
                        tree = subtree;
                        break;
                        case ')': // optional name next
                        tree = ancestors.pop();
                        break;
                        case ':': // optional length next
                        break;
                        default:
                        var x = tokens[i-1];
                        if (x == ')' || x == '(' || x == ',') {
                            tree.name = token;
                        } else if (x == ':') {
                            tree.length = parseFloat(token);
                        }
                    }
                }
            }
            catch(err) {
                moduleData.parseError = err;
                return false;
            }

            return tree;
        }

        function parseNewickRaw(txt)
        {
            // Trim any redundant comments at the begining of tree
            while(txt.charAt(0) !== '(') {
                txt = txt.substr(1);
            }

            var ancestors = [];
            var tree = {};
            var nexus = {};
            try {
                var tokens = txt.split(/\s*(;|\(|\)|,|:|\[&)\s*/);
                for (var i=0; i<tokens.length; i++) {
                    var token = tokens[i];
                    switch (token) {
                        case '[&':
                        var meta = [];
                        var j = i;
                        while(tokens[j+1].charAt(tokens[j+1].length-1) !== ']') {
                            if(tokens[j+1] !== ',') {
                                meta.push(tokens[j+1]);
                            }
                            tokens.splice(j+1, 1);
                            // j++;
                        }
                        meta.push(tokens[j+1].replace(']', ''));
                        tokens.splice(j+1, 1);
                        // Adding meta data as attributes to the objects
                        if(meta.length == 1) {
                            var temp = meta[0].split("=");
                            //  SHOULD IT BE PARSED ?
                            tree.nexus[temp[0]] = temp[1];
                        } else if(meta.length > 1) {
                            for (var k = 0; k <= meta.length; k++) {
                                if(meta[k]) {
                                    var temp = meta[k].split("=");
                                    if(temp[1]) {
                                        if(temp[1].charAt(0) == '{') {
                                            var tempArray = [temp[1].replace("{", "")];
                                            while(meta[k+1].charAt(meta[k+1].length-1) !== '}') {
                                                if(meta[k+1]) {
                                                    tempArray.push(meta[k+1]);
                                                }
                                                k++;
                                            }
                                            tempArray.push(meta[k+1].replace("}", ""));
                                            tree.nexus[temp[0]] = tempArray;
                                        } else {
                                            tree.nexus[temp[0]] = temp[1];
                                        }
                                    }
                                }
                            }
                        }
                        break;
                        case '(': // new children
                        var subtree = {};
                        tree.children = [subtree];
                        ancestors.push(tree);
                        tree = subtree;
                        break;
                        case ',': // another branch
                        var subtree = {};
                        ancestors[ancestors.length-1].children.push(subtree);
                        tree = subtree;
                        break;
                        case ')': // optional name next
                        tree = ancestors.pop();
                        break;
                        case ':': // optional length next
                        break;
                        default:
                        var x = tokens[i-1];
                        if (x == ')' || x == '(' || x == ',') {
                            tree.name = token;
                            tree.nexus = {};
                        } else if (x == ':') {
                            tree.length = parseFloat(token);
                        }
                        break;
                    }
                }
            }
            catch(err) {
                console.log(err);
                moduleData.parseError = err;
                return false;
            }

            return tree;
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

        function parseNexus(data)
        {
            try {
                var nexus = parse_nexus(data);
                if (nexus.status != NexusError.ok || nexus.treesblock.trees.length == 0) {
                    if(!isNaN(nexus.err_position) && nexus.err_position > 0) {
                        var sequence = '';
                        for (var i = 10; i > 0; i--) {
                            sequence += data.charAt(nexus.err_position - i);
                        }
                        moduleData.parseError = "<br/>Parsing error occured at character position " + nexus.err_position + ". Please review your file for possible syntax errors. For easier debugging, here is the sequence of the last 10 characters previous to error location: <strong>" + sequence + '</strong>';
                    }
                    return false;
                }

                var tree = nexus.treesblock.trees[0].newick;
                return tree;

            } catch(e) {

                return false;
            }
        }

        /**
        * This is a modified parse_nexus function that will not strip the comments from the tree block
        * @string data
        * @return
        */
        function parseNexusRaw(data)
        {
            try {
                var nexus = parse_nexus_raw(data);
                if (nexus.status != NexusError.ok || nexus.treesblock.trees.length == 0) {
                    if(!isNaN(nexus.err_position) && nexus.err_position > 0) {
                        var sequence = '';
                        for (var i = 10; i > 0; i--) {
                            sequence += data.charAt(nexus.err_position - i);
                        }
                        moduleData.parseError = "<br/>Parsing error occured at character position " + nexus.err_position + ". Please review your file for possible syntax errors. For easier debugging, here is the sequence of the last 10 characters previous to error location: <strong>" + sequence + '</strong>';
                    }
                    return false;
                }
                var tree = nexus.treesblock.trees[0].newick;
                return tree;
            } catch(e) {
                return false;
            }
        }

        function saveJson()
        {
            var settings = moduleChart.getSettings();
            var treeObject = settings.treeObject;

            if (settings.totalNodes > 4000) {
                console.log('This tree has ' + settings.totalNodes + ' nodes. Current maximum for saving is 4000 nodes.');
                alert('We appologize, but this tree seems too complex and too large in order to be saved.')
                return;
            }

            if(treeObject) {
                var jsonObject = {
                    tree: treeObject,
                    settings: moduleChart.getSettings()
                }
                console.log(jsonObject.settings);
                var seen = []
                var jsonObjectSerialized = JSON.stringify(jsonObject, function(key, val) {
                    if (val != null && typeof val == "object") {
                        if (seen.indexOf(val) >= 0)
                        return;
                        seen.push(val);
                    }
                    return val;
                });

                // var jsonObject = {
                //   tree: treeObjectSerialized,
                //   parameters: moduleChart.getExportParameters()
                // }

            } else {
                var msg = 'An error occured because data was not loaded. Please refresh the page and try again or contact support if the error persists.';
                moduleData.updateMessage(msg, 'danger')
                return;
            }

            $.ajax({
                url: 'json/save',
                async: false,
                type: 'POST',
                headers: { 'X-CSRF-TOKEN' : $('meta[name=csrf_token]').attr('content') },
                data: {data: jsonObjectSerialized},
            })
            .done(function(response) {
                var status = parseInt(response.status);
                switch(status) {
                    case 1:
                    var url = 'temp/'+response.file;
                    var urlLink = '<a href="'+url+'" target="_blank">Right click on this link to save the file in a custom location.</a>'
                    $jsonUrl.html(urlLink);
                    $jsonFile.val(response.file);
                    $jsonSaveModal.modal();
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
        }

        function deleteJson()
        {
            var file = $jsonFile.val();
            $.ajax({
                url: 'json/delete',
                type: 'POST',
                headers: { 'X-CSRF-TOKEN' : $('meta[name=csrf_token]').attr('content') },
                data: {file: file},
            })
            .done(function(response) {
                var status = parseInt(response.status);
                switch(status) {
                    case 1:
                    console.log(response.message);
                    return;
                    break;
                    case 2:
                    case -1:
                    console.log(response.message);
                    break;
                }
            })
            .fail(function() {
                console.log("error");
            });
        }

        /*
        * Force json file download
        */
        function downloadJson()
        {
            var file = $jsonFile.val();
            window.location = '/json/download/'+file;
        }

        function shareChart()
        {
            $shareChartModal.modal({backdrop: 'static', keyboard: false});
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

        return {

            init: function() {

                $fileSelect.on('change', function(e) {
                    fileSelectHandler(e);
                });

                $fileDrag.on('dragover dragleave', function(e) {
                    fileDragHover(e);
                });

                $fileDrag.on('drop', function(e) {
                    fileSelectHandler(e);
                });

                $jsonSaveBtn.on('click', function(e) {
                    saveJson(e);
                });

                $shareChartBtn.on('click', function(e) {
                    shareChart(e);
                });

                $jsonDownloadBtn.on('click', function(e) {
                    downloadJson(e);
                });

                $fileSelectlink.on('click', function(e) {
                    e.preventDefault();
                    $fileSelect.trigger('click');
                });

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

                rangeSliderN = $sliderN.slider({
                    formatter: function(value) { return value; },
                    enabled: false
                });

                rangeSliderB = $sliderB.slider({
                    formatter: function(value) { return value; },
                    enabled: false
                });

                $sliderX.on('slideStop', moduleData.updateLayoutRange);
                $sliderY.on('slideStop', moduleData.updateLayoutRange)
                $sliderN.on('slideStop', moduleData.updateLayoutRange)
                $sliderB.on('slideStop', moduleData.updateLayoutRange)

                /* Menu items click event handler */
                $menuItem.on('click', function(e) {
                    menuItemHandler(e, this);
                })

                /* Menu input and select event handler on change */
                $menuInput.on('change', function(e) {
                    e.preventDefault();
                    // If data is not loaded the menu will not work
                    if(!treeData) return;
                    var el = this;
                    var menu = $(el).closest('.treeview-menu').data('menu');
                    moduleData.menuInputAction(el, menu);
                })

                /* Menu button event handler on click */
                $menuButton.on('click', function(e) {
                    e.preventDefault();
                    // If data is not loaded the menu will not work
                    if(!treeData) return;
                    var el = this;
                    var menu = $(el).closest('.treeview-menu').data('menu');
                    moduleData.menuInputAction(el, menu);
                })

                /* Delete json file on Json Save modal close  */
                $jsonSaveModal.on('hidden.bs.modal', function(e) {
                    deleteJson(e);
                });

                /* Reset form fields on Share Chart modal close  */
                $shareChartModal.on('hidden.bs.modal', function(e) {
                    var $modal = $(this);
                    $modal.find('input').val('');
                    $modal.find('textarea').html('');
                    $modal.find('textarea').data("wysihtml5").editor.setValue('');
                    $modal.find('select').val('month');
                    $modal.find('#shareMessages').html('').attr('class', 'alert').slideUp();
                    $modal.find('#indefiniteMsg').slideUp();
                    $modal.find('#gotoUrlShareBtn').attr('href', '');
                    $modal.find('input[name=update]').val('0');
                    $modal.find('input[name=hash]').val('');
                    $modal.find('#shareChartUrl').slideUp();
                    $urlShareBtn.show();
                    $updateShareBtn.hide();
                    var validator = $modal.find('form').validate();
                    validator.resetForm();
                })

                $colorApplyBtn.on('click', function(e) {
                    $colorPickerModal.find('button').prop('disabled', true);
                    var menu = $(this).data('menu');
                    if(menu == 'misc') {
                        moduleData.applySelectionColor();
                    } else {
                        var button = $(this).data('button');
                        moduleData.applyColor(menu, button);
                        $colorPickerModal.find('button').prop('disabled', true);
                    }
                    $colorPickerModal.modal('hide');
                });

                // Update font-family on modal button click
                $fontApplyBtn.on('click', function(e) {
                    var that = this;
                    $fontSelectModal.find('button, select').prop('disabled', true);
                    var menu = $(that).data('menu');
                    var fontfamilyNew = $('#fontApplySelect').val();
                    $('form.'+menu).find('button[data-action=fontfamily]').data('selected', fontfamilyNew);
                    var settings = moduleChart.getSettings();
                    settings.menu[menu].fontfamily = fontfamilyNew;
                    moduleChart.setup(settings);
                    moduleChart.render(treeData, false);
                    $fontSelectModal.modal('hide');
                });

                $annotateSaveBtn.on('click', function(e) {
                    $(this).attr('disabled', true);
                    var info = $('#annotateNodeForm').find('textarea[name=node_info]').val();
                    var url = $('#annotateNodeForm').find('input[name=node_url]').val();
                    moduleChart.saveAnnotation(info, url);
                    moduleChart.nodeInfoSave(info, url);
                    $annotateNodeModal.find('textarea, input').attr('readonly', true);
                    $annotateNodeModal.modal('hide');
                });

                $urlLifetimeSelect.on('change', function(e) {
                    if($(this).val() == 'indefinite') {
                        $('#indefiniteMsg').slideDown();
                    } else {
                        $('#indefiniteMsg').slideUp();
                    }
                });

                $urlShareBtn.on('click', function(e) {
                    $('#shareChartForm').submit();
                });

                $updateShareBtn.on('click', function(e) {
                    $('#shareChartForm').submit();
                })

                moduleData.initPlugins();

                /* Set container height in accordance to window height */
                adjustHeight();

                $(window).on('resize', function(e) {
                    adjustHeight();
                })

                // CHART SETUP
                var settings = {
                    linkLengthX: rangeSliderX.val(),
                    linkLengthY: rangeSliderY.val()
                }

                /**
                * Share Chart. Validation and Ajax Request
                */
                $('#shareChartForm').validate({
                    rules: {
                        chart_title: {
                            required: true
                        },
                        frame_width: {
                            digits: true
                        },
                        frame_height: {
                            digits: true
                        },
                    },
                    submitHandler: function() {
                        var $form = $('#shareChartForm');
                        var settings = moduleChart.getSettings();
                        var treeObject = settings.treeObject;
                        if (settings.totalNodes > 4000) {
                            // var msg = 'This tree has ' + settings.totalNodes + ' nodes. Current maximum for saving is 4000 nodes, which means that certain parts of the tree will be collapased in order to display it.';
                            var msg = 'We appologize, but this tree seems too complex and too large in order to be saved/shared. Please send us a feedback with issue description.';
                            var alert = 'alert-warning';
                            $('#shareMessages').html(msg).addClass(alert).slideDown();
                            return;
                        }

                        if(treeObject) {
                            var jsonObject = {
                                tree: treeObject,
                                settings: moduleChart.getSettings()
                            }
                            var seen = []
                            var jsonObjectSerialized = JSON.stringify(jsonObject, function(key, val) {
                                if (val != null && typeof val == "object") {
                                    if (seen.indexOf(val) >= 0)
                                    return;
                                    seen.push(val);
                                }
                                return val;
                            });

                            $.ajax({
                                url: '/json/save-share',
                                type: 'POST',
                                method: 'POST',
                                async: false,
                                headers: { 'X-CSRF-TOKEN' : $('meta[name=csrf_token]').attr('content') },
                                data: {
                                    chart_title : $form.find('input[name=chart_title]').val(),
                                    chart_description : $form.find('textarea[name=chart_description]').val(),
                                    frame_width : $form.find('input[name=frame_width]').val(),
                                    frame_height : $form.find('input[name=frame_height]').val(),
                                    chart_lifetime : $form.find('select[name=chart_lifetime]').val(),
                                    update : $form.find('input[name=update]').val(),
                                    hash : $form.find('input[name=hash]').val(),
                                    json_data: jsonObjectSerialized
                                },
                                beforeSend: function() {
                                    $urlShareBtn.prop('disabled', true);
                                    moduleData.blockForm($form);
                                },
                                complete: function() {
                                    $urlShareBtn.prop('disabled', false);
                                    moduleData.unblockForm($form);
                                }
                            })
                            .done(function(response) {
                                var status = parseInt(response.status);
                                switch (status) {
                                    case 1:
                                    $('#urlShareInput').text(response.iframe);
                                    $('#gotoUrlShareBtn').attr('href', response.url);
                                    $urlShareBtn.hide();
                                    $updateShareBtn.show();
                                    $('#shareChartForm input[name=update]').val('1');
                                    $('#shareChartForm input[name=hash]').val(response.hash);
                                    $('#shareChartUrl').slideDown();
                                    $('#shareMessages').html('Your chart has been saved successfully.<br/>Update the properties and use the code/link bellow this form to share it.<br/><strong>Warning:</strong> You won\'t be able to update the chart properties after you close this window.').attr('class', 'alert alert-success').slideDown();
                                    break;
                                    case 2:
                                    var html = '<ul>';
                                    $.each(response.errors, function(index, el) {
                                        html += '<li>'+el[0]+'</li>';
                                    });
                                    html += '</ul>';
                                    $('#shareMessages').html(html).attr('class', 'alert alert-danger').slideDown();
                                    break;
                                    case 3:
                                    case 4:
                                    $('#shareMessages').html(response.message).attr('class', 'alert alert-danger').slideDown();
                                    break;
                                }
                            })
                            .fail(function() {
                                $('#shareMessages').html('Unknown error occured. Please try again.').attr('class', 'alert alert-danger').slideDown();
                            });

                        } else {
                            var msg = 'An error occured because data was not loaded. Please refresh the page, reload the data and try again. Please send us a message if the error persists.';
                            $('#shareMessages').html(msg).attr('class', 'alert alert-danger');
                            return;
                        }
                    }
                })

                moduleChart.setup(settings);

                loadExamples();

            },

            initPlugins: function() {

                /* Color Picker*/
                $colorPicker.colorpicker({
                    // defaultPalette: 'web'
                });

                /* HTML5 Editor */
                $("textarea[name=node_info]").wysihtml5({
                    "font-styles": false,
                    "emphasis": true,
                    "lists": true,
                    "html": false,
                    "link": true,
                    "image": false
                });

                $("textarea[name=chart_description]").wysihtml5({
                    "font-styles": false,
                    "emphasis": true,
                    "lists": false,
                    "html": false,
                    "link": true,
                    "image": false
                });

                /* Numeric Spinner */
                $( ".spinner" ).spinner({
                    step: 1,
                    // max: 10,
                    min: 0,
                    numberFormat: "n",
                });

                // Init. Clipboard.js plugin
                var clipboard = new Clipboard('#copyCodeBtn');
                clipboard.on('success', function(e) {
                    $('#gotoUrlShareBtn').after('<label>Code Copied!</label>');
                    setTimeout(function () {
                        $('#gotoUrlShareBtn').siblings('label').fadeOut(function(){
                            $(this).remove();
                        });
                    }, 1000);
                    e.clearSelection();
                });

                /* Spinner fix */
                $('.ui-spinner-button').click(function() {
                    $(this).siblings('input').change();
                });

                $('.ui-spinner-input').on('keyup keydown', function(e) {
                    // e.preventDefault();
                    that = this;
                    if(e.keyCode == 13) {
                        $(that).trigger('change');
                    }
                });
            },

            loadMenuUI: function() {
                var settings = moduleChart.getSettings();
                var nexusAttrAll = settings.nexusAttrAll;
                var nexusAttrSingle = settings.nexusAttrSingle;
                var nexusAttrArray = settings.nexusAttrArray;
                $.each(settings.menu, function(menu, dataset) {
                    var $form = $('form.'+menu);
                    $.each(dataset, function(action, value) {
                        switch (action) {
                            case 'showhide':
                            var element = $form.find('input[data-action=showhide]');
                            var checked = (value == 'show') ? true : false;
                            if(checked) {
                                $form.find('input, button, select').prop('disabled', false);
                            } else {
                                $form.find('input, button, select').not($(element)).prop('disabled', true);
                            }
                            $(element).val(value).prop('checked', checked);
                            break;
                            case 'automatic':
                            var element = $form.find('input[data-action=automatic]');
                            var checked = (value == 'show') ? true : false;
                            if(checked) {
                                $form.find('input[data-action=scale]').prop('disabled', true);
                            } else {
                                $form.find('input[data-action=automatic]').prop('disabled', false);
                            }
                            $(element).val(value).prop('checked', checked);
                            break;
                            case 'annotation':
                            var element = $form.find('input[data-action=annotation]');
                            var checked = (value == 'show') ? true : false;
                            break;
                            case 'display':
                            if(menu == 'node-bars') {
                                var options = '';
                                var data = nexusAttrArray;
                            } else {
                                var options = '<option value="name">name</option>';
                                var data = nexusAttrAll;
                            }
                            if(data.length > 0) {
                                $.each(data, function(index, val) {
                                    // var selected = value == val ? 'selected="selected"' : '';
                                    options += '<option value="'+val+'">'+val+'</option>';
                                });
                            }
                            $form.find('select[data-action='+action+']').html(options).val(value);
                            break;
                            case 'colorby':
                            case 'sizeby':
                            var options = '<option value="none" selected="selected">none</option>';
                            if(nexusAttrSingle.length > 0) {
                                $.each(nexusAttrSingle, function(index, val) {
                                    options += '<option value="'+val+'">'+val+'</option>';
                                });
                            }
                            $form.find('select[data-action='+action+']').html(options).val(value);
                            break;
                            case 'fontsize':
                            case 'sigdigits':
                            case 'minsize':
                            case 'maxsize':
                            $form.find('input[data-action='+action+']').val(value);
                            break;
                            case 'fontfamily':
                            $form.find('button[data-action='+action+']').data('selected', value);
                            break;
                            case 'format':
                            case 'shape':
                            $form.find('select[data-action='+action+']').val(value);
                            break;
                            case 'colorstart':
                            case 'colorend':
                            $form.find('button[data-action='+action+'] + div.color-status').css('background-color', value);
                            break;
                            case 'projection':
                            $form.find('select[data-action='+action+']').val(value);
                            break;
                            case 'barwidth':
                            $form.find('input[data-action='+action+']').val(value);
                            break;
                            default:
                            $form.find('input[data-action='+action+']').val(value);
                            $form.find('select[data-action='+action+']').val(value);
                            break;
                        }
                    });

                });
            },

            showToolbar: function() {
                var settings = moduleChart.getSettings();
                var $menuLayout = $('ul.treeview-menu[data-menu=layout]');
                var $menuMisc = $('ul.treeview-menu[data-menu=misc]');
                $menuLayout.find('li > a[data-item='+settings.activeLayout+']').parent().addClass('selected');
                $menuMisc.find('li > a[data-item='+settings.activeLinkSelect+']').parent().addClass('selected');
                moduleData.updateRangeSliderState(settings.activeLayout);
                $jsonSaveDiv.removeClass('hidden');
                // @TEMP. REMOVE LATER
                moduleData.loadMenuUI();

                rangeSliderX.slider('setAttribute', 'max', settings.linkLengthXMax);
                rangeSliderY.slider('setAttribute', 'max', settings.linkLengthYMax);
                rangeSliderX.slider('setValue', parseInt(settings.linkLengthX));
                rangeSliderY.slider('setValue', parseInt(settings.linkLengthY));
                rangeSliderN.slider('setValue', parseInt(settings.nodeRadiusFactor));
                rangeSliderB.slider('setValue', parseInt(settings.branchWidth));
                rangeSliderN.slider('enable');
                rangeSliderB.slider('enable');
            },

            menuItemAction: function(menu, item) {
                var settings = {};
                switch(menu) {
                    /* MENU: Layout */
                    case 'layout':
                    moduleData.updateLayoutType(item);
                    break;
                    /* MENU: Misc. */
                    case 'misc':
                    switch(item) {
                        case 'branch':
                        case 'clade':
                        case 'taxa':
                        settings = {
                            activeLinkSelect: item,
                        };
                        moduleChart.setup(settings);
                        moduleChart.resetSelection();
                        break;
                        case 'color':
                        $colorPickerModal.find('button').prop('disabled', false);
                        $('#colorApplyBtn').data('menu', 'misc');
                        $colorPickerModal.modal();
                        break;
                        case 'rotate':
                        if( moduleChart.rotate() ) {
                            moduleChart.render(treeData, false);
                            moduleData.updateMessage(null, null);
                        } else {
                            moduleData.updateMessage('No node is selected for rotation', 'warning');
                        }
                        break;
                        case 'sort':
                        var $sortMenu = $('a[data-item=sort]');
                        var direction = $sortMenu.data('sort');
                        moduleChart.sorting(direction);
                        moduleChart.render(treeData, false);
                        moduleData.updateMessage(null, null);
                        if(direction == 'up') {
                            $sortMenu.data('sort', 'down');
                            $sortMenu.find('i').attr('class', 'fa fa-arrow-down');
                        } else {
                            $sortMenu.data('sort', 'up');
                            $sortMenu.find('i').attr('class', 'fa fa-arrow-up');
                        }
                        break;
                        case 'annotate':
                        var node = moduleChart.nodeSelected();
                        if( node ) {
                            if(node.meta !== undefined ) {
                                // $('#annotateNodeForm').find('textarea[name=node_info]').val(node.meta.annotation.info);
                                $('#annotateNodeForm').find('textarea[name=node_info]').data("wysihtml5").editor.setValue(node.meta.annotation.info);
                                $('#annotateNodeForm').find('input[name=node_url]').val(node.meta.annotation.url);
                            }
                            $annotateNodeModal.find('textarea, input').attr('readonly', false);
                            $annotateSaveBtn.attr('disabled', false);
                            $annotateNodeModal.modal();
                            moduleData.updateMessage(null, null);
                        } else {
                            moduleData.updateMessage('No node is selected for annotation', 'warning');
                        }
                        break;
                    }
                    break;
                }
            },

            updateLayoutType: function(layout) {

                // Updating chart title with proper tree names
                var title = 'Tree';
                switch (layout) {
                    case 'tree':
                        title = 'Phylogram';
                        break;
                    case 'cluster':
                        title = 'Cladogram';
                        break;
                    case 'radial-tree':
                        title = 'Circular Phylogram';
                        break;
                    case 'radial-cluster':
                        title = 'Circular Cladogram';
                        break;
                    default:

                }
                var settings = {
                    activeLayout: layout,
                    chartTitle: title
                };

                moduleChart.setup(settings);
                moduleChart.render(treeData, true);
                moduleData.updateRangeSliderState(layout);

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
                    case 'sliderN':
                    settings.nodeRadiusFactor = e.value;
                    center = false;
                    break;
                    case 'sliderB':
                    settings.branchWidth = e.value;
                    center = false;
                    break;
                }

                moduleChart.setup(settings);
                moduleChart.render(treeData, center); // false: Do not center the chart

            },

            updateRangeSliderState: function(layout) {

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

            applySelectionColor: function() {
                var colorValue = $colorPicker.colorpicker("val");
                var settings = {
                    selectionColor : colorValue
                };
                moduleChart.setup(settings);
                moduleChart.colorSelection();
                $('.color-status.selection-color').css('background-color', colorValue);
            },

            applyColor: function(menu, button) {
                var colorValue = $colorPicker.colorpicker("val");
                var settings = moduleChart.getSettings();
                settings.menu[menu][button] = colorValue;
                moduleChart.setup(settings);
                moduleChart.render(treeData, false);
                $('form.'+menu).find('button[data-action='+button+'] + div.color-status').css('background-color', colorValue);
            },

            menuInputAction: function(element, menu) {
                var action = $(element).data('action');
                var $form = $('form.'+menu);
                var settings = moduleChart.getSettings();
                switch (action) {
                    case 'showhide':
                    var checked = $(element).is(':checked');
                    if(checked) {
                        $form.find('input, button, select').prop('disabled', false);
                        settings.menu[menu].showhide = 'show';
                    } else {
                        $form.find('input, button, select').not($(element)).prop('disabled', true);
                        settings.menu[menu].showhide = 'hide';
                    }
                    break;
                    case 'automatic':
                    var checked = $(element).is(':checked');
                    if(checked) {
                        $form.find('input[data-action=scale]').prop('disabled', true);
                        settings.menu[menu].automatic = 'show';
                    } else {
                        $form.find('input[data-action=scale]').prop('disabled', false);
                        settings.menu[menu].automatic = 'hide';
                    }
                    break;
                    case 'annotation':
                    var checked = $(element).is(':checked');
                    if(checked) {
                        settings.menu[menu].annotation = 'show';
                    } else {
                        settings.menu[menu].annotation = 'hide';
                    }
                    break;
                    case 'display':
                    case 'fontsize':
                    case 'format':
                    case 'sigdigits':
                    case 'shape':
                    case 'colorby':
                    case 'sizeby':
                    case 'barwidth':
                    var valueNew = $(element).val();
                    settings.menu[menu][action] = valueNew;
                    break;
                    case 'colorstart':
                    case 'colorend':
                    $('#colorApplyBtn').data('menu', menu).data('button', action);
                    $colorPickerModal.find('button').prop('disabled', false);
                    $colorPickerModal.modal();
                    break;
                    case 'fontfamily':
                    $fontApplyBtn.data('menu', menu);
                    var fontFamilySelected = $form.find('button[data-action=fontfamily]').data('selected'); $fontSelectModal.find('select').val(fontFamilySelected);
                    $fontSelectModal.find('button, select').prop('disabled', false);
                    $fontSelectModal.modal();
                    break;
                    case 'minsize':
                    var minsizeNew = parseInt($(element).val());
                    var maxsizeNew = parseInt($form.find('input[data-action=maxsize]').val());
                    if(minsizeNew > maxsizeNew) {
                        alert('Min. size cannot be greater than Max. size.');
                        minsizeNew = maxsizeNew;
                        $(element).val(minsizeNew);
                    }
                    settings.menu[menu][action] = minsizeNew;
                    break;
                    case 'maxsize':
                    var minsizeNew = parseInt($form.find('input[data-action=minsize]').val());
                    var maxsizeNew = parseInt($(element).val());
                    if(maxsizeNew < minsizeNew) {
                        alert('Max. size cannot be smaller than Min. size.');
                        maxsizeNew = minsizeNew;
                        $(element).val(maxsizeNew);
                    }
                    settings.menu[menu][action] = maxsizeNew;
                    break;
                    case 'projection':
                    var valueNew = $(element).val();
                    settings.menu[menu][action] = valueNew;
                    break;
                    default:
                    var valueNew = $(element).val();
                    settings.menu[menu][action] = valueNew;
                    break;
                }
                // Redraw chart
                moduleChart.setup(settings);
                moduleChart.render(treeData, false);
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

            blockForm: function(form) {
                $(form).block({
                    message: '<h4>Processing ...</h4><img src="/assets/img/spinner_2.gif" />',
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
            },

            unblockForm: function(form) {
                $(form).unblock();
            }

        }

    })();

    return moduleData;

});
