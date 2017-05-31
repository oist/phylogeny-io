define([], function () {

    var chart = (function(){

        /* DOM Selector Vars */
        var $phylogeneticTree = $("#phylogeneticTree");
        var $treeScale = $("#treeScale");
        var $nodeInfo = $('#nodeInfo');

        /* Chart Settings Vars */
        var settings = {
            treeObject : null,
            activeLayout: 'tree',
            activeLinkSelect: 'branch',
            activeLinkType: 'elbow',
            activeTransform: 'linear',
            chartTitle: 'Phylogram',
            zoomScale: 0.3,
            nodeRadius: 4,
            nodeRadiusFactor: 3,
            branchWidth: 3,
            linkLengthX: 2000,
            linkLengthXMax: 5000,
            linkLengthY: 100,
            linkLengthYMax: 1000,
            selectionColor: 'orange',
            nexusAttrAll: [],
            nexusAttrSingle: [],
            nexusAttrArray: [],
            nexusAttrMinMax: {},
            altAttr: ['id', 'depth', 'name', 'length'],
            totalNodes: 0,
            selectedNode: null,
            menu: {
                'tip-labels' : {
                    showhide: 'show',
                    display: 'name',
                    colorby: 'none',
                    colorstart: '#fff',
                    colorend: 'blue',
                    fontsize: '12',
                    fontfamily: 'Arial, Helvetica, sans-serif',
                    format: 'decimal',
                    sigdigits: '4',
                },
                'node-labels' : {
                    showhide: 'hide',
                    display: 'name',
                    colorby: 'none',
                    colorstart: '#fff',
                    colorend: 'blue',
                    fontsize: '12',
                    fontfamily: 'Arial, Helvetica, sans-serif',
                    format: 'decimal',
                    sigdigits: '4',
                },
                'node-bars' : {
                    showhide: 'hide',
                    display: 'none',
                    barwidth: '5'
                },
                'node-shapes' : {
                    showhide: 'show',
                    annotation: 'hide',
                    shape: 'circle',
                    sizeby: 'none',
                    minsize: '5',
                    maxsize: '20',
                    colorby: 'none',
                    colorstart: '#fff',
                    colorend: 'blue',
                },
                'branch-labels' : {
                    showhide: 'hide',
                    display: 'name',
                    colorby: 'none',
                    colorstart: '#fff',
                    colorend: 'blue',
                    fontsize: '12',
                    fontfamily: 'Arial, Helvetica, sans-serif',
                    format: 'decimal',
                    sigdigits: '4',
                    projection : 'elbow'
                },
                'branch-projection' : {
                    projection : 'elbow'
                },
                'scale-bar' : {
                    showhide: 'show',
                    automatic: 'show',
                    scale: '1',
                    lineweight: '5',
                    fontsize: '12',
                    fontfamily: 'Arial, Helvetica, sans-serif',
                }
            }
        };

        /* Default Chart Vars */
        var root, baseSvg, svgGroup, scaleSvg, scaleLineGroup, scaleTextGroup;
        var totalNodes = 0;
        var maxLabelLength = 0;
        var minNodeLength = 0;
        var maxNodeLength = 0;
        var maxDepth = 0;
        var maxOffset = 0;
        var minLength, maxLength;
        var totalLeaves = 0;
        var panSpeed = 200;
        var panBoundary = 20; // Within 20px from edges will pan when dragging.
        var i = 0;
        var duration = 800;
        var nodeBorderColor = 'steelblue';
        var nodeBorderWidth = 1;
        var nodeColorOpened = '#fff';
        var nodeColorClosed = 'lightsteelblue';
        var nodeLabelColor = '#000';
        var leafLabelColor = '#000';
        var branchLabelColor = '#000';
        var zoomExtentMin = 0.02;
        var zoomExtentMax = 7;
        var linkLengthXBase = 25000;
        var linkLengthYBase = 25000;
        var scaleValue = 0;
        var scaleWidth = 0;
        /* Chart size Vars */
        var viewerWidth, viewerHeight, diameter;
        /* Layout Vars */
        var tree, cluster, radialTree, radialCluster;
        /* Projection Vars */
        var diagonal, diagonalRadial, direct, directRadial, elbow, elbowRadial, arcDiagonal;
        /* Misc. Vars */
        var tip;
        // Define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
        var zoomListener = d3.behavior.zoom().scaleExtent([zoomExtentMin, zoomExtentMax]).on("zoom", zoom);

        /**
        * FUNCTIONS
        */

        /**
        * Helper function for adjusting link length
        */
        function phylo(n, offset, type) {
            var param = type == 'linear' ? settings.linkLengthX/3 : settings.linkLengthX/5;
            if (n.length) {
                offset += n.length * param;
                if(minLength == null) minLength = n.length;
                if(maxLength == null) {
                    maxLength = n.length;
                    maxOffset = n.length * param;
                }
            }
            n.y = offset;

            // Various calculations
            if(n.length < minLength) { minLength = n.length }
            if(n.length > maxLength) {
                maxLength = n.length;
                maxOffset = n.length * param;
            }
            if(n.depth > maxDepth) maxDepth = n.depth;

            // Recursively call function on node's children
            if (n.children) {
                n.children.forEach(function(n) {
                    phylo(n, offset, type);
                });
            }
        }

        /**
        * Helper recursive function for calculating the max depth of a node
        * @param node object
        * @return int
        */
        function getMaxDepth(node) {
            if(node.children == undefined) {
                return node.depth;
            } else {
                if(node.children[0] !== undefined && node.children[1] !==undefined) {
                    var depth1 = getMaxDepth(node.children[0]);
                    var depth2 = getMaxDepth(node.children[1]);
                } else {
                    var depth = node.children[0] ? getMaxDepth(node.children[0]) : getMaxDepth(node.children[1]);
                    return depth;
                }
                if(depth1 > depth2) return depth1;
                else return depth2;
            }
        }

        /**
        * Recursive function that calculates the maximum sum of branch's attribute
        */
        function getMaxWeight(node, attr, sum) {
            if(node.children == undefined) {
                sum = sum + Number(node.nexus[attr])
                return sum;
            } else {
                if(node.children[0] !== undefined && node.children[1] !==undefined) {
                    var s1 = sum + Number(node.children[0].nexus[attr]);
                    var s2 = sum + Number(node.children[1].nexus[attr]);
                    var sum1 = getMaxWeight(node.children[0], attr, s1);
                    var sum2 = getMaxWeight(node.children[1], attr, s2);
                } else {
                    if(node.children[0]) {
                        sum = sum + Number(node.children[0].nexus[attr]);
                        return getMaxWeight(node.children[0], attr, sum);
                    } else {
                        sum = sum + Number(node.children[1].nexus[attr]);
                        return getMaxWeight(node.children[1], attr, sum);
                    }
                }
                if(sum1 > sum2) return sum1;
                else return sum2;
            }
        }

        /**
        * Helper function for calculating projection
        */
        function project(d) {
            var r = d.y, a = (d.x - 90) / 180 * Math.PI;
            return [r * Math.cos(a), r * Math.sin(a)];
        }

        /**
        * A recursive helper function for performing some setup by walking through all nodes
        */
        function visit(parent, visitFn, childrenFn) {
            if (!parent) return;

            visitFn(parent);

            var children = childrenFn(parent);
            if (children) {
                var count = children.length;
                for (var i = 0; i < count; i++) {
                    visit(children[i], visitFn, childrenFn);
                }
            }
        }

        /**
        * Sort the tree according to the node names
        */
        function sortTree() {
            tree.sort(function(a, b) {
                return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
            });
        }

        /**
        * Panning the tree
        */
        function pan(domNode, direction) {
            var speed = panSpeed;
            if (panTimer) {
                // d3.select('#phylogeneticTree').style("cursor", "move");
                clearTimeout(panTimer);
                translateCoords = d3.transform(svgGroup.attr("transform"));
                if (direction == 'left' || direction == 'right') {
                    translateX = direction == 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                    translateY = translateCoords.translate[1];
                } else if (direction == 'up' || direction == 'down') {
                    translateX = translateCoords.translate[0];
                    translateY = direction == 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
                }
                scaleX = translateCoords.scale[0];
                scaleY = translateCoords.scale[1];
                scale = zoomListener.scale();
                svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
                d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
                zoomListener.scale(zoomListener.scale());
                zoomListener.translate([translateX, translateY]);
                panTimer = setTimeout(function() {
                    pan(domNode, speed, direction);
                }, 50); // Initiatly 50
            }
        }

        /**
        * Define the zoom function for the zoomable tree
        */
        function zoom() {
            // Adjust the width of links on zoom
            if(d3.event.sourceEvent.type == 'wheel' && d3.event.type == 'zoom') {
                settings.zoomScale = d3.event.scale;
            }
            svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            scaleLineGroup.attr("transform", "translate(1,1)scale(" + d3.event.scale + ', 1' + ")");
        }

        /**
         * Helper functions for collapsing nodes
         */
        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse); // comment this line if only the clicked node needs to collapse
                d.children = null;
            }
        }

        /**
         * Helper functions for expanding nodes
         */
        function expand(d) {
            if (d._children) {
                d.children = d._children;
                d.children.forEach(expand); // comment this line if only the clicked node needs to expand
                d._children = null;
            }
        }

        /**
        * Toggle children function
        */
        function toggleChildren(d) {
            if (d.children) {
                collapse(d);
            } else if (d._children) {
                expand(d);
            }
            return d;
        }

        /**
        * Toggle children on click
        */
        function dblclick(d) {
            if (d3.event.defaultPrevented) return; // click suppressed
            d = toggleChildren(d);
            chart.render(d, true);
        }

        /**
        * Adding helper meta data in json tree object
        */
        function selectInRoot(obj, type, ids) {
            switch(type) {
                case 'node':
                visit(settings.treeObject, function(d) {
                    if(d.id == obj.id) {
                        if(d.meta.selection.node) {
                            // Node already selected - deselect it
                            d.meta.selection.node = false;
                        } else {
                            // Selecting the node
                            d.meta.selection.node = true;
                        }
                    } else {
                        d.meta.selection.node = false;
                    }
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                })
                break;

                case 'branch':
                visit(settings.treeObject, function(d) {
                    if(d.id == obj.target.id) {
                        if(d.meta.selection.branch) {
                            // Branch already selected - deselect it
                            d.meta.selection.branch = false;
                        } else {
                            // Selecting the branch
                            d.meta.selection.branch = true;
                        }
                    }
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                })
                break;

                case 'clade':
                visit(settings.treeObject, function(d) {
                    if(_.contains(ids, d.id) ) {
                        if(d.meta.selection.clade) {
                            // Clade already selected - deselect it
                            d.meta.selection.clade = false;
                        } else {
                            // Selecting the clade
                            d.meta.selection.clade = true;
                        }
                    } else {
                        d.meta.selection.clade = false;
                    }
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                })
                break;

                case 'taxa':
                visit(settings.treeObject, function(d) {
                    if( _.contains(ids, d.id) ) {
                        if(d.meta.selection.taxa) {
                            // Taxa already selected
                            d.meta.selection.taxa = false;
                        } else {
                            // Selecting the taxa
                            d.meta.selection.taxa = true;
                        }
                    } else {
                        d.meta.selection.taxa = false;
                    }
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                })
                break;
            }
        }

        /**
        * Adding color meta data in json tree object
        */
        function colorInRoot() {
            visit(settings.treeObject, function(d) {
                if(d.meta.selection[settings.activeLinkSelect]) {
                    d.meta.color[settings.activeLinkSelect] = settings.selectionColor;
                    d.meta.selection[settings.activeLinkSelect] = false;
                }
            }, function(d) {
                return d.children && d.children.length > 0 ? d.children : null;
            })
        }

        /**
        * Handle node selection event
        */
        function selectNode(d) {
            // if (d3.event.defaultPrevented) return; // click suppressed
            var alreadySelected = d3.select(this).select('rect.nodeShape').classed("selected");
            if(alreadySelected) {
                // Deselect the node
                d3.select(this).select('rect.nodeShape').classed({'nodeShape' : true, 'selected' : false});
                chart.nodeInfoDisplay('hide');
                settings.selectedNode = null;
            } else {
                // Add node annotation to floating div
                if(d.meta) {
                    chart.nodeInfoSave(d.meta.annotation.info, d.meta.annotation.url);
                }
                // Deselect all other and select new node
                svgGroup.selectAll("rect.selected").attr('class', 'nodeShape');
                d3.select(this).select('rect.nodeShape').classed({'nodeShape' : true, 'selected' : true});
                chart.nodeInfoDisplay('show');
                settings.selectedNode = d.id;
            }
        }

        /**
        * Handle link selection event
        */
        function selectLink(d) {
            // if (d3.event.defaultPrevented) return; // click suppressed
            switch(settings.activeLinkSelect) {
                case 'branch':
                selectionBranch(d, this);
                break;
                case 'clade':
                selectionClade(d, this);
                break;
                case 'taxa':
                selectionTaxa(d, this);
                break;
            }
        }

        /**
        * Select branch
        */
        function selectionBranch(d, that) {
            var linkDeselectClasses = { 'link' : true, 'selected' : false};
            var linkSelectClasses = { 'link' : true, 'selected' : true};
            if(d3.select(that).classed('selected')) {
                d3.select(that).classed('selected', false)
            } else {
                // svgGroup.selectAll("path.link.selected").classed(linkDeselectClasses);
                d3.select(that).classed(linkSelectClasses);
            }
            // Selection in JSON object
            selectInRoot(d, settings.activeLinkSelect, null);
        }

        /**
        * Select clade
        */
        function selectionClade(d, that) {
            var childrenNodesIds = [];
            var childrenCount = 0;
            visit(d.target, function(d) {
                childrenCount++;
                childrenNodesIds.push(d.id);
            }, function(d) {
                return d.children && d.children.length > 0 ? d.children : null;
            })

            var linkDeselectClasses = { 'link' : true, 'selected' : false};
            var linkSelectClasses = { 'link' : true, 'selected' : true};
            if(d3.select(that).classed('selected')) {
                svgGroup.selectAll("path.link")
                .filter(function (link) { // <-E
                    return _.contains(childrenNodesIds, link.source.id) || _.contains(childrenNodesIds, link.target.id);
                })
                .classed(linkDeselectClasses);
            } else {
                svgGroup.selectAll("path.link")
                // .classed(linkDeselectClasses)
                .filter(function (link) { // <-E
                    return _.contains(childrenNodesIds, link.source.id) || _.contains(childrenNodesIds, link.target.id);
                })
                .classed(linkSelectClasses);
            }
            // Selection in JSON object
            selectInRoot(d, settings.activeLinkSelect, childrenNodesIds);
        }

        /**
        * Select taxa
        */
        function selectionTaxa(d, that) {
            // Get node IDs
            var leafNodesIds = [];
            var leafCount = 0;
            visit(d.target, function(d) {
                leafCount++;
                !d.children ? leafNodesIds.push(d.id) : null;
            }, function(d) {
                return d.children;
            })

            svgGroup.selectAll("rect.nodeShape")
            .classed('taxa', false)
            .filter(function (node) { // <-E
                return _.contains(leafNodesIds, node.id);
            })
            .classed('taxa', true)

            // Selection in JSON object
            selectInRoot(d, settings.activeLinkSelect, leafNodesIds);
        }

        /**
        * Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children
        */
        function centerNode(source, type) {
            var isRoot = (source.parent == undefined) ? true : false;
            var root = source;
            var scale = zoomListener.scale();

            if(type == 'linear') {
                var selected = d3.selectAll('rect.nodeShape.selected');
                if(selected[0].length > 0) {
                    var temp = selected.data();
                    source = temp[0];
                }
                x = source.y0;
                y = source.x0;
            } else {
                var selected = d3.selectAll('rect.nodeShape.selected');
                if(selected[0].length > 0) {
                    var temp = selected.data();
                    source = temp[0];
                }
                var sourceProjected = project({x: source.x0, y: source.y0})
                x = sourceProjected[0];
                y = sourceProjected[1];
            }

            var xTranslate = - (x * scale) + (viewerWidth / 2);
            var yTranslate = - (y * scale) + (viewerHeight / 2);
            d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + xTranslate + "," + yTranslate + ")scale(" + scale + ")");

            zoomListener.scale(scale);
            zoomListener.translate([xTranslate, yTranslate]);

            // @TODO: Scale svgGroup to fit the svg container
            if(svgGroup) {
                return;
                var svgWidth = baseSvg[0][0].getBoundingClientRect().width;
                var svgHeight = baseSvg[0][0].getBoundingClientRect().height;
                var treeWidth = svgGroup[0][0].getBoundingClientRect().width;
                var treeHeight = svgGroup[0][0].getBoundingClientRect().height;
                // while(svgWidth < treeWidth || svgHeight < treeHeight) {
                //   scale = scale - 0.1;
                // }

            }
        }

        /**
        Calculate and get node attributes based od selected preferences
        */
        function getNodeAttr(attr, d) {
            if(d.nexus != undefined && d.nexus[settings.menu['node-shapes'].sizeby] != undefined) {
                var nodeSize = getNodeSize(d.nexus[settings.menu['node-shapes'].sizeby]) * settings.nodeRadiusFactor;
            } else {
                var nodeSize = settings.nodeRadius * settings.nodeRadiusFactor;
            }

            switch (settings.menu['node-shapes'].shape) {
                case 'circle':
                var nodeAttr = {"rx" : nodeSize, "ry" : nodeSize, "x" : -nodeSize/2, "y" : -nodeSize/2, "width" : nodeSize, "height" : nodeSize, "transform" : "rotate(0)"};
                break;
                case 'rectangle':
                var nodeAttr = {"rx" : 0, "ry" : 0, "x" : -nodeSize/2, "y" : -nodeSize/2, "width" : nodeSize, "height" : nodeSize, "transform" : "rotate(0)"};
                break;
                case 'diamond':
                var nodeAttr = {"rx" : 0, "ry" : 0, "x" : -nodeSize/2, "y" : -nodeSize/2, "width" : nodeSize, "height" : nodeSize, "transform" : "rotate(45)"};
                break;
                default:
                var nodeAttr = {"rx" : nodeSize, "ry" : nodeSize, "x" : -nodeSize/2, "y" : -nodeSize/2, "width" : nodeSize, "height" : nodeSize, "transform" : "rotate(0)"};
                break;
            }

            return nodeAttr[attr];
        }

        function getTextOffset(d) {
            if(d.nexus != undefined && d.nexus[settings.menu['node-shapes'].sizeby] != undefined) {
                var nodeSize = getNodeSize(d.nexus[settings.menu['node-shapes'].sizeby]) * settings.nodeRadiusFactor;
            } else {
                var nodeSize = settings.nodeRadius * settings.nodeRadiusFactor;
            }

            return nodeSize;
        }

        function getNodeSize(val) {
            var sizeby = settings.menu['node-shapes'].sizeby;
            if(settings.nexusAttrMinMax[sizeby] !== undefined) {
                var x = d3.scale.linear()
                .domain([
                    settings.nexusAttrMinMax[sizeby].min,
                    settings.nexusAttrMinMax[sizeby].max
                ])
                .range([
                    Number(settings.menu['node-shapes'].minsize), Number(settings.menu['node-shapes'].maxsize)
                ]);
                var nodeSize = x(val);
            } else {
                var nodeSize = settings.nodeRadius;
            }
            return nodeSize;
        }

        function formatLabels(d, nodeType) {
            // Display text based on the selected or default display choice
            var textDisplay = d['name'];
            if(settings.menu[nodeType].display !== 'name') {
                // Display empty string if display attribute is not available
                if(d.nexus == undefined || d.nexus[settings.menu[nodeType].display] == undefined) {
                    textDisplay = '';
                } else {
                    textDisplay = d.nexus[settings.menu[nodeType].display];
                    // Get the number of digits for formating
                    var sigdigits = "4"; // default value
                    sigdigits = settings.menu[nodeType].sigdigits;
                    if(textDisplay.constructor === Array) {
                        var temp = [];
                        for (var i = 0; i < textDisplay.length; i++) {
                            switch (settings.menu[nodeType].format) {
                                case 'decimal':
                                var formatDecimal = d3.format("."+ sigdigits + "f");
                                temp[i] = formatDecimal(Number(textDisplay[i]));
                                break;
                                case 'percent':
                                var formatPercent = d3.format(",%");
                                temp[i] = formatPercent(Number(textDisplay[i]));
                                break;
                                case 'scientific':
                                var formatScientific = d3.format(".0e");
                                temp[i] = formatScientific(Number(textDisplay[i]));
                                break;
                            }
                        }
                        textDisplay = temp;
                    } else {
                        switch (settings.menu[nodeType].format) {
                            case 'decimal':
                            var formatDecimal = d3.format("."+ sigdigits + "f");
                            textDisplay = formatDecimal(Number(textDisplay));
                            break;
                            case 'percent':
                            var formatPercent = d3.format(",%");
                            textDisplay = formatPercent(Number(textDisplay));
                            break;
                            case 'scientific':
                            var formatScientific = d3.format(".0e");
                            textDisplay = formatScientific(Number(textDisplay));
                            break;
                        }
                    }
                }
                return textDisplay.toString();
            }
            return textDisplay.toString();
        }

        function chromaColor(color1, color2, min, max, value) {
            var colors = [color1, color2];
            var cs = chroma.scale(colors).domain([min, max]).mode('lab').correctLightness();
            return cs(value).hex();
        }

        return {

            setup: function(options) {

                $.each(options, function(index, val) {
                    settings[index] = val;

                    if(index == 'selectedNode' && val == null) {
                        settings.zoomScale = 0.3; // revert to defalt value
                    }
                });
            },

            init: function(dataReady) {

                if(!dataReady) {
                    alert('No data available to render the chart!');
                    return;
                }

                /* Clear previous svg/html */
                chart.reset();
                /* Initialize layouts */
                chart.layouts();
                /* Initialize projections */
                chart.projections();
                /* Initialize tooltip */
                chart.tooltip();
                /* Call visit function to calculate some basic tree properties */
                chart.calculate(dataReady);
                /* For large trees, collapse nodes */
                if(totalLeaves > 1000) {
                    alert('The data you are trying to load contains more than 1000 leaf nodes, which will result in poor browser performance.\nFor that reason only the first 1000 leaf nodes are displayed while others are collapsed within its parent nodes.');
                    chart.collapseLargeTree(dataReady);
                }
                /* Load Zoom Scale - initial or saved */
                zoomListener.scale(settings.zoomScale);
                /* Define the baseSvg, attaching a class for styling and the zoomListener */
                baseSvg = d3.select("#phylogeneticTree").append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .attr("class", "overlay")
                .call(zoomListener)
                .on("dblclick.zoom", null) // disables zoom on double click
                .call(tip);
                /* Append a group which holds all nodes and which the zoom Listener can act upon */
                svgGroup = baseSvg.append("g");

                /* Define the scaleSvg */
                scaleSvg = d3.select("#treeScale").append("svg")
                .attr("width", viewerWidth)
                .attr("height", '20px');

                scaleLineGroup = scaleSvg.append("g");
                scaleTextGroup = scaleSvg.append("g");
                /* Define the root */
                settings.treeObject = root = dataReady;
                root.x0 = viewerHeight / 2;
                root.y0 = 0;
                /* Render scale */
                chart.renderScale(root);
                /* Render the chart */
                chart.render(root, true);
                /* Additional updates after the tree rendering is done */
                chart.postRender();
            },

            layouts: function() {
                viewerWidth = $phylogeneticTree.width();
                viewerHeight = $phylogeneticTree.height();
                diameter = viewerHeight/4*3;

                tree = d3.layout.cluster()
                .size([viewerHeight, viewerWidth])
                .separation(function separation(a, b) { return 1; });

                cluster = d3.layout.cluster()
                .size([viewerHeight, viewerWidth])
                .separation(function separation(a, b) { return 1; });

                radialTree = d3.layout.cluster()
                .size([360, diameter])
                // .sort(null)
                .children(function(d) { return d.children; })
                .separation(function(a, b) { return 1; });

                radialCluster = d3.layout.cluster()
                .size([360, diameter])
                .separation(function(a, b) { return 1; });
            },

            projections: function() {

                diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.y, d.x];
                }),

                diagonalRadial = d3.svg.diagonal.radial()
                .projection(function(d) {
                    return [d.y, d.x / 180 * Math.PI];
                }),

                elbow = function(d, i) {
                    return ( "M" + d.source.y + "," + d.source.x + "V" + d.target.x + "H" + d.target.y );
                };

                elbowRadial = function(d) {
                    var source = project(d.source),
                    moveto = project({x: d.target.x, y: d.source.y}),
                    target = project(d.target),
                    radius = d.source.y,
                    rotation = 0,
                    largeArc = 0,
                    sweep = d.target.x > d.source.x ? 1 : 0;

                    return (
                        "M" + source[0] + "," + source[1] + " " +
                        "A" + radius + "," + radius + " " + rotation + " " + largeArc + "," + sweep + " " + moveto[0] + "," + moveto[1] + " " +
                        "L" + target[0] + "," + target[1]);
                };

                direct = function(d, i) {
                    return ( "M" + d.source.y + "," + d.source.x + "L" + d.target.y + ", " + d.target.x );
                };

                directRadial = function(d) {
                    var source = project(d.source),
                    target = project(d.target);

                    return (
                        "M" + source[0] + "," + source[1] +
                        "L" + target[0] + "," + target[1]);
                };

                arcDiagonal = function (d, i) {
                    return "M" + d.source.y + "," + d.source.x
                    + "C" + d.source.y + "," + d.source.x
                    + " " + d.source.y + "," + d.target.x
                    + " " + d.target.y + "," + d.target.x;
                };

                arcRadial = function (d, i) {
                    var source = project(d.source),
                    target = project(d.target);

                    return "M" + source[0] + "," + source[1]
                    + "C" + source[0] + "," + source[1]
                    + " " + source[0] + "," + target[1]
                    + " " + target[0] + "," + target[1];
                };
            },

            tooltip: function() {
                tip = d3.tip().attr('class', 'd3-tip')
                .html(function(d) {
                    var content = '<div>Name: '+d.name+'</div>';
                    content += '<div>ID: '+d.id+'</div>';
                    content += '<div>Depth: '+d.depth+'</div>';
                    content += '<div>Length: '+d.length+'</div>';
                    if(d.nexus) {
                        $.each(d.nexus, function(index, val) {
                            content += '<div>'+ index +': '+val+'</div>';
                        });
                    }
                    return content;
                })
                .offset([-20, 0]);
            },

            calculate: function(data) {

                visit(data, function(d) {
                    totalNodes++;
                    if(d.meta == undefined) {
                        d.meta = {
                            color: {},
                            selection: {},
                            annotation: {
                                info: '',
                                url: ''
                            }
                        };
                    }

                    // Extract Nexus parameters,
                    if(d.nexus) {
                        $.each(d.nexus, function(index, val) {
                            // Add parameters names to helper arrays
                            if(settings.nexusAttrAll.indexOf(index) == -1) {
                                if(val.constructor !== Array) {
                                    settings.nexusAttrSingle.push(index);
                                    // Parse string values to numbers
                                    settings.nexusAttrMinMax[index] = { min: Number(val), max: Number(val)};
                                } else {
                                    settings.nexusAttrArray.push(index);
                                }
                                settings.nexusAttrAll.push(index);
                            }

                            if(settings.nexusAttrMinMax[index] != undefined ) {
                                var valueNum =  Number(val);
                                // Determine min and max values
                                if(valueNum < settings.nexusAttrMinMax[index].min)
                                settings.nexusAttrMinMax[index].min = valueNum;
                                if(valueNum > settings.nexusAttrMinMax[index].max)
                                settings.nexusAttrMinMax[index].max = valueNum;
                            }
                        })
                    }

                    // if(d.depth > maxDepth) { maxDepth = d.depth; };
                    if(d.children !== undefined) totalLeaves++;
                    maxLabelLength = Math.max(d.name.length, maxLabelLength);
                    var length = (d.length != undefined) ? d.length : 0;
                    minNodeLength = Math.min(length, minNodeLength);
                    maxNodeLength = Math.max(length, maxNodeLength);

                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                });

                /* Calculate Maximum range values and current slider position */
                /* @TODO: There is for sure a better way to do it but requires some calculus with total nodes/leaves */
                // X SLIDER OPTIMIZE
                if(linkLengthXBase > maxNodeLength) {
                    settings.linkLengthXMax = (linkLengthXBase / maxNodeLength).toFixed();
                } else {
                    settings.linkLengthXMax = (linkLengthXBase * 100 / maxNodeLength).toFixed();
                }
                settings.linkLengthX = (settings.linkLengthXMax / 5).toFixed();
                // Y SLIDER OPTIMIZE
                var multiplier = totalLeaves > 500 ? 10 : 5;
                settings.linkLengthYMax = (linkLengthYBase / totalLeaves * multiplier).toFixed();
                settings.linkLengthY = (settings.linkLengthYMax / 5).toFixed();
                settings.totalNodes = totalNodes;
            },

            collapseLargeTree: function(data) {
                var totalN = 0;
                var totalL = 0;
                var totalCollapsed = 0;
                var maxRender = 1000;
                visit(data, function(d) {
                    if(totalL > maxRender) {
                        if (d.children) {
                            d._children = d.children;
                            d._children.forEach(collapse);
                            d.children = null;
                            totalCollapsed++;
                        }
                    }
                    // Count leaves
                    if(d.children == null && d._children == null) {
                        totalL++;
                    }
                    // Count all nodes
                    totalN++;
                }, function(d) {
                    return d.children && d.children.length > 0 ? d.children : null;
                });
                settings.linkLengthYMax = (totalL / 5).toFixed();
                settings.linkLengthY = (settings.linkLengthYMax / 5).toFixed();
            },

            render: function(source, center) {
                source == root ? settings.treeObject = source : null;
                switch(settings.activeLayout) {
                    case 'tree':
                    case 'cluster':
                    settings.activeTransform = 'linear';
                    break;
                    case 'radial-tree':
                    case 'radial-cluster':
                    settings.activeTransform = 'radial';
                    break;
                }
                /* Render chart */
                chart.draw(source, settings.activeLayout);
                /* Center chart*/
                if(center == true) {
                    centerNode(source, settings.activeTransform);
                }

                /* Render the chart title */
                $('#chartTitle').html(settings.chartTitle);
                $('.tree-depth > span').html(maxDepth == 0 ? 'n/a' : maxDepth);
            },

            postRender: function() {
                /* Render the stats in chart footer */
                $('.tree-nodes > span').html(totalNodes);
                $('.tree-leaves > span').html(totalLeaves);
            },

            renderScale: function(root) {
                /* Adjust the svg coordinates and scale */
                scaleLineGroup.attr("transform", "translate(1,1)scale(" + settings.zoomScale + ', 1' + ")");
                scaleTextGroup.attr("transform", "translate(1,1)scale(1, 1)");

                /* Append initial svg elements */
                scaleLineGroup.append('line')
                .classed('scaleLine', true)
                .style('stroke', 'black')
                .style('stroke-width', settings.menu['scale-bar'].lineweight + 'px')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', 0)
                .attr('y2', 0);

                scaleTextGroup.append("text")
                .classed('scaleText', true)
                .attr("text-anchor", "start")
                .style('font-size', settings.menu['scale-bar'].fontsize + 'px')
                .style("fill", 'black')
                .attr("x", 0)
                .attr("y", parseInt(settings.menu['scale-bar'].lineweight) + 10 );
            },

            draw: function(source, layout) {
                var levelWidth = [1];
                var childCount = function(level, n) {
                    if (n.children && n.children.length > 0) {
                        if (levelWidth.length <= level + 1) levelWidth.push(0);
                        levelWidth[level + 1] += n.children.length;
                        n.children.forEach(function(d) {
                            childCount(level + 1, d);
                        });
                    }
                };
                childCount(0, root);

                switch (layout) {
                    case 'tree':
                    var newHeight = d3.max(levelWidth) * settings.linkLengthY;
                    tree = cluster.size([newHeight, viewerWidth]);
                    // Compute the new cluster layout.
                    var nodes = cluster.nodes(root),
                    links = cluster.links(nodes);

                    maxOffset = 0;
                    maxLength = 0;
                    minLength = 0;
                    phylo(nodes[0], 0, 'linear');
                    break;

                    case 'cluster':
                    var newHeight = d3.max(levelWidth) * settings.linkLengthY;
                    if(settings.linkLengthX > 30) {
                        var newWidth = d3.max(levelWidth) * settings.linkLengthX/5;
                    } else {
                        var newWidth = d3.max(levelWidth) * settings.linkLengthX;
                    }
                    cluster = cluster.size([newHeight, newWidth]);
                    // Compute the new tree layout.
                    var nodes = cluster.nodes(root).reverse(),
                    links = cluster.links(nodes);
                    // Calculate max Depth
                    nodes.forEach(function(d) {
                        if(d.depth > maxDepth) maxDepth = d.depth;
                    });
                    break;

                    case 'radial-tree':
                    var newHeight = d3.max(levelWidth) * settings.linkLengthY;
                    // tree = tree.size([newHeight, viewerWidth]);
                    // Compute the new tree layout.
                    var nodes = radialTree.nodes(root),
                    links = radialTree.links(nodes);

                    maxOffset = 0;
                    maxLength = 0;
                    minLength = 0;
                    phylo(nodes[0], 0, 'radial');
                    break;

                    case 'radial-cluster':
                    if(settings.linkLengthX > 30) {
                        var newWidth = d3.max(levelWidth) * settings.linkLengthX/5;
                    } else {
                        var newWidth = d3.max(levelWidth) * settings.linkLengthX;
                    }
                    radialCluster = radialCluster.size([360, newWidth]);
                    // Compute the new tree layout.
                    var nodes = radialCluster.nodes(root).reverse(),
                    links = radialCluster.links(nodes);
                    nodes.forEach(function(d) {
                        if(d.depth > maxDepth) maxDepth = d.depth;
                    });
                    break;
                }

                /**********************/
                /**  UPDATE SCALE   **/
                /*********************/
                if(settings.menu['scale-bar'].automatic == 'show') {
                    // Automaticaly determine scale value, 10th of maximum branch length
                    scaleValue = Math.round(maxLength/10);
                    if(scaleValue == 0) {
                        scaleValue = (maxLength/10).toFixed(2);
                    }
                    scaleWidth = (parseFloat(maxOffset) * scaleValue) / parseFloat(maxLength);
                } else {
                    // User inputs the scale value
                    scaleValue = parseFloat(settings.menu['scale-bar'].scale);
                    scaleWidth = (parseFloat(maxOffset) * parseFloat(settings.menu['scale-bar'].scale)) / parseFloat(maxLength);
                }

                var scaleSvgHeight = parseInt(settings.menu['scale-bar'].lineweight) + parseInt(settings.menu['scale-bar'].fontsize);
                scaleSvg.attr("height", (scaleSvgHeight + scaleSvgHeight/4).toString() + 'px' )
                .style('display', function(d) {
                    if(layout == 'tree' || layout == 'radial-tree') {
                        var showhide = settings.menu['scale-bar'].showhide;
                        return showhide == 'show' ? 'block' : 'none';
                    }
                    return 'none';
                });

                // Update scale line
                scaleLineGroup.select('line.scaleLine')
                .transition()
                .duration(duration)
                .attr('x1', 0)
                .attr('x2', scaleWidth)
                .style('stroke-width', settings.menu['scale-bar'].lineweight + 'px');

                // Update the scale text
                scaleTextGroup.select('text.scaleText')
                .transition()
                .duration(duration)
                .style('font-size', settings.menu['scale-bar'].fontsize + 'px')
                .style('font-family', settings.menu['scale-bar'].fontfamily)
                .attr("y", scaleSvgHeight )
                .text(scaleValue);

                /**********************/
                /**    ADD NODES    **/
                /*********************/
                var node = svgGroup.selectAll("g.node")
                .data(nodes, function(d) {
                    return d.id || (d.id = ++i);
                });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                .classed('node', true)
                .classed('leaf', function(d) {
                    return d.children || d._children ? false : true;
                })
                .attr("transform", function(d) {
                    if(settings.activeTransform == 'linear') {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    } else {
                        return "rotate(" + (source.x0 - 90) + ")translate(" + source.y0 + ")";
                    }
                })
                .on('dblclick', dblclick)
                .on('click', selectNode)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

                // Add node shape
                nodeEnter.append('rect')
                .classed('nodeShape', true)
                .classed('selected', function(d) {
                    if(settings.selectedNode !== null && settings.selectedNode == d.id) {
                        return true;
                    }
                    return false;
                })
                .style("fill", function(d) {
                    return d._children ? nodeColorClosed : nodeColorOpened;
                })
                .style("fill-opacity", 0)
                .style('stroke', nodeBorderColor)
                .style('stroke-width', (nodeBorderWidth * settings.nodeRadiusFactor/2).toString() + "px");

                // Update the node
                node.select('rect.nodeShape')
                .transition()
                .duration(duration)
                .attr({
                    "rx" : function(d) { return getNodeAttr("rx", d) },
                    "ry" : function(d) { return getNodeAttr("ry", d) },
                    "x" : function(d) { return getNodeAttr("x", d) },
                    "y" : function(d) { return getNodeAttr("y", d) },
                    "width" : function(d) { return getNodeAttr("width", d) },
                    "height" : function(d) { return getNodeAttr("height", d) },
                    "transform" : function(d) { return getNodeAttr("transform", d) }
                })
                .style('display', function(d) {
                    var showhide = settings.menu['node-shapes'].showhide;
                    return showhide == 'show' ? 'block' : 'none';
                })
                .style("fill", function(d) {
                    var fill = nodeColorOpened;
                    if(settings.nexusAttrMinMax[settings.menu['node-shapes'].colorby] != undefined) {
                        var colorbyVal = settings.menu['node-shapes'].colorby;
                        var minVal = settings.nexusAttrMinMax[colorbyVal].min;
                        var maxVal = settings.nexusAttrMinMax[colorbyVal].max;
                        var color1 = settings.menu['node-shapes'].colorstart;
                        var color2 = settings.menu['node-shapes'].colorend;
                        if(d.nexus != undefined && d.nexus[colorbyVal] != undefined) {
                            fill = chromaColor(color1, color2, minVal, maxVal, Number(d.nexus[colorbyVal]));
                        }
                    }
                    // Priority coloring
                    if(d.meta.color.taxa) { fill  = d.meta.color.taxa }
                    if(d.meta.color.node) { fill  = d.meta.color.node }
                    if(d._children) { fill = nodeColorClosed; }
                    return fill;
                })
                .style("fill-opacity", 1)
                .style('stroke', nodeBorderColor)
                .style('stroke-width', (nodeBorderWidth * settings.nodeRadiusFactor/2).toString() + "px");

                // Transition nodes to their new position.
                node.transition()
                .duration(duration)
                .attr("transform", function(d) {
                    if(settings.activeTransform == 'linear') {
                        return "translate(" + d.y + "," + d.x + ")";
                    } else {
                        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    }
                });

                // Exiting nodes and text
                node.exit()
                .transition()
                .duration(duration)
                .attr("transform", function(d) {
                    if(settings.activeTransform == 'linear') {
                        return "translate(" + source.y + "," + source.x + ")";
                    } else {
                        return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                    }
                })
                .style("fill-opacity", 0)
                .remove();

                // Stash the old positions for transition.
                nodes.forEach(function(d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });

                /***************************/
                /** ADD NODE & LEAF TEXT **/
                /*************************/
                nodeEnter.append("text")
                .attr("dy", ".35em")
                .classed('nodeText', function(d) {
                    return d.children || d._children ? true : false;
                })
                .classed('leafText', function(d) {
                    return d.children || d._children ? false : true;
                });

                // Update the node text
                node.select('text.nodeText')
                .transition()
                .duration(duration)
                .attr("text-anchor", "end")
                .attr("x", function(d) { return -getTextOffset(d); })
                .text(function(d) { return formatLabels(d, 'node-labels'); })
                .style('display', function(d) {
                    return settings.menu['node-labels'].showhide == 'show' ? 'block' : 'none';
                })
                .style('font-size', function(d) {
                    return settings.menu['node-labels'].fontsize+'px';
                })
                .style('font-family', function(d) {
                    return settings.menu['node-labels'].fontfamily;
                })
                .style("fill", function(d) {
                    var fill = nodeLabelColor;
                    if(settings.nexusAttrMinMax[settings.menu['node-labels'].colorby] != undefined) {
                        var colorbyVal = settings.menu['node-labels'].colorby;
                        var minVal = settings.nexusAttrMinMax[colorbyVal].min;
                        var maxVal = settings.nexusAttrMinMax[colorbyVal].max;
                        var color1 = settings.menu['node-labels'].colorstart;
                        var color2 = settings.menu['node-labels'].colorend;
                        if(d.nexus != undefined && d.nexus[colorbyVal] != undefined) {
                            fill = chromaColor(color1, color2, minVal, maxVal, Number(d.nexus[colorbyVal]));
                        }
                    }
                    return fill;
                });

                // Update the leaf text
                node.select('text.leafText')
                .transition()
                .duration(duration)
                .attr("text-anchor", "start")
                .attr("x", function(d) { return getTextOffset(d); })
                .text(function(d) { return formatLabels(d, 'tip-labels'); })
                .style('display', function(d) {
                    return settings.menu['tip-labels'].showhide == 'show' ? 'block' : 'none';
                })
                .style('font-size', function(d) {
                    return settings.menu['tip-labels'].fontsize+'px';
                })
                .style('font-family', function(d) {
                    return settings.menu['tip-labels'].fontfamily;
                })
                .style('font-style', 'italic')
                .style("fill", function(d) {
                    var fill = leafLabelColor;
                    if(settings.nexusAttrMinMax[settings.menu['tip-labels'].colorby] != undefined) {
                        var colorbyVal = settings.menu['tip-labels'].colorby;
                        var minVal = settings.nexusAttrMinMax[colorbyVal].min;
                        var maxVal = settings.nexusAttrMinMax[colorbyVal].max;
                        var color1 = settings.menu['tip-labels'].colorstart;
                        var color2 = settings.menu['tip-labels'].colorend;
                        if(d.nexus != undefined && d.nexus[colorbyVal] != undefined) {
                            fill = chromaColor(color1, color2, minVal, maxVal, Number(d.nexus[colorbyVal]));
                        }
                    }
                    return fill;
                });

                /***********************/
                /**   ADD BRANCHES   **/
                /*********************/
                var link = svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    return d.target.id;
                });

                // Enter branches initial
                link.enter().insert("path", "g")
                .classed("link", true)
                .style("stroke-opacity", 0)
                .on('click', selectLink);

                // Transition
                link.transition()
                .duration(duration)
                .attr("d", function(d) {
                    var linkProjection = settings.menu['branch-projection'].projection;
                    if(settings.activeTransform == 'linear') {
                        switch (linkProjection) {
                            case "elbow": return elbow(d); break;
                            case "diagonal": return diagonal(d); break;
                            case "direct": return direct(d); break;
                        }
                    } else {
                        switch (linkProjection) {
                            case "elbow": return elbowRadial(d); break;
                            case "diagonal": return diagonalRadial(d); break;
                            case "direct": return directRadial(d); break;
                        }
                    }
                })
                .style("stroke", function(d) {
                    var stroke = null;
                    if(d.target.meta.color.clade) {
                        stroke = d.target.meta.color.clade;
                    }
                    if(d.target.meta.color.branch) {
                        stroke = d.target.meta.color.branch;
                    }
                    return stroke;
                })
                .style("stroke-width", settings.branchWidth + "px")
                .style("stroke-opacity", 1);

                // Exiting Branches
                link.exit().transition()
                .duration(duration)
                .style("stroke-opacity", 0)
                .remove();

                /**********************/
                /** ADD BRANCH TEXT **/
                /********************/
                var linkText = svgGroup.selectAll("text.linkText")
                .data(links, function(d) {
                    return d.target.id;
                });

                // Enter branch text
                linkText.enter().insert("text")
                .classed('linkText', true)
                .attr("dy", ".35em")
                .attr("text-anchor", "middle")
                .style("fill-opacity", 0)

                // Transition
                linkText.transition()
                .duration(duration)
                .attr("x", function(d) {
                    var linkProjection = settings.menu['branch-projection'].projection;
                    if(settings.activeTransform == 'linear') {
                        switch (linkProjection) {
                            case "elbow": return (d.target.y + (d.source.y - d.target.y)/2); break;
                            case "diagonal": return ((d.source.y + d.target.y)/2); break;
                            case "direct": return ((d.source.y + d.target.y)/2); break;
                        }
                    } else {
                        switch (linkProjection) {
                            case "elbow": return project({x: d.target.x, y: d.source.y})[0]; break;
                            case "diagonal":
                            case "direct":
                            return ( (project({x: d.source.x, y: d.source.y })[0] + project({x: d.target.x, y: d.target.y })[0]) / 2);
                            break;                  }
                        }
                    })
                    .attr("y", function(d) {
                        var linkProjection = settings.menu['branch-projection'].projection;
                        if(settings.activeTransform == 'linear') {
                            switch (linkProjection) {
                                case "elbow": return d.target.x; break;
                                case "diagonal": return ((d.source.x + d.target.x)/2); break;
                                case "direct": return ((d.source.x + d.target.x)/2); break;
                            }
                        } else {
                            switch (linkProjection) {
                                case "elbow": return project({x: d.target.x, y: d.source.y})[1]; break;
                                case "diagonal":
                                case "direct":
                                return ( (project({x: d.source.x, y: d.source.y })[1] + project({x: d.target.x, y: d.target.y })[1]) / 2);
                                break;
                            }
                        }
                    })
                    .text(function(d) { return formatLabels(d.target, 'branch-labels'); })
                    .style('display', function(d) {
                        return settings.menu['branch-labels'].showhide == 'show' ? 'block' : 'none';
                    })
                    .style('font-size', function() {
                        return settings.menu['branch-labels'].fontsize+'px';
                    })
                    .style('font-family', function() {
                        return settings.menu['branch-labels'].fontfamily;
                    })
                    .style('fill', function(d) {
                        var fill = branchLabelColor;
                        if(settings.nexusAttrMinMax[settings.menu['branch-labels'].colorby] != undefined) {
                            var colorbyVal = settings.menu['branch-labels'].colorby;
                            var minVal = settings.nexusAttrMinMax[colorbyVal].min;
                            var maxVal = settings.nexusAttrMinMax[colorbyVal].max;
                            var color1 = settings.menu['branch-labels'].colorstart;
                            var color2 = settings.menu['branch-labels'].colorend;
                            if(d.target.nexus != undefined && d.target.nexus[colorbyVal] != undefined) {
                                fill = chromaColor(color1, color2, minVal, maxVal, Number(d.target.nexus[colorbyVal]));
                            }
                        }
                        return fill;
                    })
                    .style("fill-opacity", 1);

                    // Exiting branch text
                    linkText.exit().transition()
                    .duration(duration)
                    .style("fill-opacity", 0)
                    .remove();

                    /**********************/
                    /** ADD NODE BARS **/
                    /********************/
                    var nodeBar = svgGroup.selectAll("rect.nodeBar")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });

                    // Enter node bars initial
                    nodeBar.enter().insert("rect", "g")
                    .classed('nodeBar', true)
                    .style("fill-opacity", 0);

                    // Transition
                    nodeBar.transition()
                    .duration(duration)
                    .attr({
                        "width" : function(d) {
                            if(d.nexus != undefined) {
                                var data = d.nexus[settings.menu['node-bars'].display];
                                if(data != undefined) {
                                    var barLength = parseFloat(maxOffset) * parseFloat(data[1] - data[0]) / parseFloat(maxLength);
                                    return barLength.toString() + 'px';
                                }
                            }
                            return '0px';
                        },
                        "height" : settings.menu['node-bars'].barwidth,
                    })
                    .attr("transform", function(d) {
                        if(settings.activeTransform == 'linear') {
                            if(d.nexus != undefined) {
                                var data = d.nexus[settings.menu['node-bars'].display];
                                if(data != undefined) {
                                    var barLength = parseFloat(maxOffset) * parseFloat(data[1] - data[0]) / parseFloat(maxLength);
                                    var dy = d.y - (barLength / 2);
                                    var dx = d.x - settings.menu['node-bars'].barwidth + settings.menu['node-bars'].barwidth/2;
                                    return "translate(" + dy + "," + dx + ")";
                                }
                            }
                            return "translate(" + d.y + "," + d.x + ")";
                        } else {
                            if(d.nexus != undefined) {
                                var data = d.nexus[settings.menu['node-bars'].display];
                                if(data != undefined) {
                                    var barLength = parseFloat(maxOffset) * parseFloat(data[1] - data[0]) / parseFloat(maxLength);
                                    var dy = d.y - (barLength / 2);
                                    var dz = (settings.menu['node-bars'].barwidth *3/2) / 180 *Math.PI;
                                    return "rotate(" + (d.x - 90 - dz) + ")translate(" + dy + ")";
                                }
                            }
                            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
                        }
                    })
                    .style("fill-opacity", 0.6)
                    .style('fill', nodeBorderColor)
                    .style('display', function(d) {
                        if(layout == 'tree' || layout == 'radial-tree') {
                            var showhide = settings.menu['node-bars'].showhide;
                        } else {
                            var showhide = "hide";
                        }
                        return showhide == 'show' ? 'block' : 'none';
                    });

                    // Exiting the node bars
                    nodeBar.exit().transition()
                    .duration(duration)
                    .style("fill-opacity", 0)
                    .remove();

                },

                colorSelection: function() {
                    if(settings.activeLinkSelect == 'taxa') {
                        // Color the selected nodes
                        d3.selectAll('rect.taxa').style("fill", settings.selectionColor).classed('taxa', false);
                    } else {
                        // Color the selected links
                        d3.selectAll('path.link.selected').style("stroke", settings.selectionColor).classed('selected', false);
                    }
                    colorInRoot();
                },

                rotate: function() {
                    var node = d3.select('rect.nodeShape.selected').data();
                    if(node.length !== 0) {
                        var parent = node[0];
                        if(parent !== undefined && parent.children) {
                            var temp = parent.children[0];
                            parent.children[0] = parent.children[1];
                            parent.children[1] = temp;
                        } else {
                            return false;
                        }
                        return true;
                    }
                    return false;
                },

                sorting: function(direction) {
                    visit(settings.treeObject, function(d) {
                        if(d.children && d.children.length == 2) {
                            var child1Depth = getMaxDepth(d.children[0]);
                            var child2Depth = getMaxDepth(d.children[1]);
                            if (direction == 'down') {
                                if(child1Depth < child2Depth) {
                                    var temp = d.children[0];
                                    d.children[0] = d.children[1];
                                    d.children[1] = temp;
                                }
                            } else {
                                if(child1Depth > child2Depth) {
                                    var temp = d.children[1];
                                    d.children[1] = d.children[0];
                                    d.children[0] = temp;
                                }
                            }
                        }
                    }, function(d) {
                        return d.children && d.children.length > 0 ? d.children : null;
                    });
                    return;
                },

                nodeSelected: function() {
                    var node = d3.select('rect.nodeShape.selected').data();
                    return node[0] !== undefined ? node[0] : false;
                },

                saveAnnotation: function(info, url) {
                    var node = d3.select('rect.nodeShape.selected').data();
                    if(node[0] !== undefined) {
                        node[0].meta.annotation.info = info;
                        node[0].meta.annotation.url = url;
                    }
                    return;
                },

                reset: function() {
                    settings.nexusAttrAll = [];
                    settings.nexusAttrSingle = [];
                    settings.nexusAttrArray = [];
                    settings.nexusAttrMinMax = {};
                    settings.altAttr = ['id', 'depth', 'name', 'length'];
                    settings.nodeRadius = 4;
                    branchWidth = 3,
                    totalNodes = 0;
                    maxLabelLength = 0;
                    minNodeLength = 0;
                    maxNodeLength = 0;
                    maxDepth = 0;
                    maxOffset = 0;
                    totalLeaves = 0;
                    panSpeed = 200;
                    panBoundary = 20;
                    i = 0;
                    duration = 800;
                    zoomExtentMin = 0.02;
                    zoomExtentMax = 7;
                    scaleValue = 0;
                    scaleWidth = 0;

                    $phylogeneticTree.html('');
                    $treeScale.html('');
                    zoomListener = d3.behavior.zoom().scaleExtent([zoomExtentMin, zoomExtentMax]).on("zoom", zoom);
                },

                resetSelection: function() {
                    svgGroup.selectAll("path.link.selected").classed('selected', false);
                    svgGroup.selectAll("rect.taxa").classed('taxa', false);
                },

                getSettings: function() {
                    return settings;
                },

                nodeInfoSave: function(info, url) {
                    if(info !== '') {
                        var text = info.replace(/(?:\r\n|\r|\n)/g, '<br />');
                    } else {
                        var text = '<em>Additional info is not available</em>';
                    }
                    if(url !== '') {
                        var image = '<a href="'+url+'" target="_blank"><img src="'+url+'"></a>';
                    } else {
                        var image = '<em>Image is not available</em>';
                    }
                    var content = '';
                    content += '<div><strong>Additional info:</strong><br>'+ text +'</div>';
                    content += '<div class="margin-top: 15px"><strong>Image:</strong><br>'+image+'</div>';
                    $nodeInfo.find('.info-content').html(content);
                },

                nodeInfoDisplay: function(display) {
                    // Display annotation only if checked
                    if(settings.menu['node-shapes'].annotation == 'show') {
                        if (display == 'show') {
                            $nodeInfo.animate({'right': '0px'}, 400);
                        } else {
                            $nodeInfo.animate({'right': '-300px'}, 400);
                        }
                    }
                    return;
                },
            }

    })();

    return chart;

})
