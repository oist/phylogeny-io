(function() {  

  // getElementById
  function $id(id) {
    return document.getElementById(id);
  }


  // output information
  function Output(msg) {
    var m = $id("messages");
    m.innerHTML = msg + m.innerHTML;      
  }


  // file drag hover
  function FileDragHover(e) {
    e.stopPropagation();
    e.preventDefault();
    e.target.className = (e.type == "dragover" ? "hover" : "");
  }


  // file selection
  function FileSelectHandler(e) {

    // cancel event and hover styling
    FileDragHover(e);

    // fetch FileList object
    var files = e.target.files || e.dataTransfer.files;

    // process all File objects
    for (var i = 0, f; f = files[i]; i++) {
      ParseFile(f);
    }

  }

  // output file information
  function ParseFile(file) {

    if (file.type.indexOf("text") == 0) {
      // Txt file - test if newick
      var reader = new FileReader();
      reader.onload = function(e) {
        // Output(e.target.result);        
        var readyData = newick2Data(e.target.result);  
        if(readyData) {
          showToolbar();
          initChart(readyData);
        } else {
          alert('Data format is not valid.\nPlease provide data in standard Newick notation');
        }
      }
      reader.readAsText(file);

    } else if(file.type == '') {
      // JSON file probably
      var reader = new FileReader();
      reader.onload = function(e) {
        // Output(e.target.result);        
        var readyData = validateJSON(e.target.result);        
        if(readyData) {
          console.log(readyData);
          showToolbar();
          initChart(readyData);
        } else {
          alert('JSON file is invalid.\nPlease provide json file exported with Phylogenic Web app.');
        }                
      }
      reader.readAsText(file);
    } else {
      alert(file.type);
      // alert('File not supported. Only .txt files are currently supported.')
    }

  }

  function validateJSON(fileData) {    
    try {
      var data = JSON.parse(fileData);      
      // if came to here, then valid
      return data;
    } catch(e) {
      // failed to parse
      return null;
    }
  }

  function newick2Data(fileData) {

    /* Converting the data and loading the nodes */
    try {
      var parsedData = newick.parse(fileData);
      return parsedData;
    }
    catch(err) {        
        return false;
    }


  }

  function json2Data(fileData) {

  }


  // initialize
  function Init() {

    JSON_OBJECT = null;
    var fileselect = $id("fileselect"),
        filedrag = $id("filedrag"),
        submitbutton = $id("submitbutton");

    // file select
    fileselect.addEventListener("change", FileSelectHandler, false);

    // is XHR2 available?
    var xhr = new XMLHttpRequest();
    if (xhr.upload) {

      // file drop
      filedrag.addEventListener("dragover", FileDragHover, false);
      filedrag.addEventListener("dragleave", FileDragHover, false);
      filedrag.addEventListener("drop", FileSelectHandler, false);
      filedrag.style.display = "block";

      // remove submit button
      submitbutton.style.display = "none";
    }

    // @TODO: Place in separate function
    $('#saveJson').on('click', function(){
      if(!JSON_OBJECT) {
        alert('No data is loaded.');
      } else {
        console.log(JSON_OBJECT);        
        // return;
        seen = []
        var jsonSend = JSON.stringify(JSON_OBJECT, function(key, val) {
           if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0)
                    return
                seen.push(val)
            }
            return val
        });
        
        $.ajax({
          url: 'php/save_json.php',
          async: false,
          type: 'POST',
          data: {data: jsonSend},
        })
        .done(function(data) {
          var response = $.parseJSON( data );
          var status = parseInt(response.status);          
          switch(status) {
            case 1:
                var url = 'temp/'+response.file;
                var urlLink = '<a href="'+url+'" target="_blank">Right click on this link to save the file in a custom location.</a>'
                $('#jsonUrl').html(urlLink);                
                $('#jsonFile').val(response.file);
                $('#jsonUrlModal').modal();
              break;
            case 2:

              break;
            default:
              break;
          }
        })
        .fail(function() {
          console.log("error");
        });        
      }
    })

    // initPlugins();

  }

  /*
   * Force json file download
   */
  $('#jsonDownload').on('click', function() {
    var file = $('#jsonFile').val();
    window.location = 'download.php?file='+file;
  })

  $( "#fileselectLink" ).on( "click", function() {    
    $( "#fileselect" ).trigger( "click" );
  });
  $( "#filedrag-body" ).on( "dragover", function() {    
    $( "#filedrag" ).addClass( "hover" );
  });
  /**
   * Delete json file on server   
   */
  $('#jsonUrlModal').on('hidden.bs.modal', function () {
    var file = $('#jsonFile').val();
    $.ajax({
      url: 'delete_json.php',
      type: 'POST',
      data: {file: file},
    })
    .done(function(data) {
      var response = $.parseJSON( data );
      var status = parseInt(response.status);
      switch(status) {
            case 1:
              // console.log(response.message);
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
  })

  function initPlugins()
  {
    // Colorpicker
    // $('.btn-color').colpick({
    //   layout:'hex',
    //   submit:1,
    //   onSubmit:function(hsb,hex,rgb,el) {
    //     $(el).colpickHide();
    //     // $(el).css('background-color', '#'+hex);
    //     $(el).colpickHide();
    //   }                  
    // });
    // 
    $(".pick-a-color").pickAColor({
      showHexInput: false,
      // showAdvanced: false,
      showSavedColors: false,
      // showSpectrum: false
    });

    // @TODO: Create separate function for this
    $(".pick-a-color").on("change", function () {      
      var rgb = hexToRgb($(this).val());
      var newColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
      var selectedBtn = $("button.link.active");
      if(selectedBtn.data('type') == 'taxa') {
        // Color the selected nodes
        d3.selectAll('circle.taxa').style("fill", newColor).classed('taxa', false);
      } else {
        // Color the selected links
        d3.selectAll('path.link.selected').style("stroke", newColor).classed('selected', false);
      }      
      // var selected = $('button.link.active').data('type');
      // switch(selected) {
      //   case 'branch':

      //   break;
      //   case 'clade':
      //   break;
      // }
    });

    // Initialize Range Slider
    LINK_LENGTH = $('#linkLength').slider({
      formatter: function(value) {
        return 'Current value: ' + value;
      }
    })
    .data('slider');
    LINK_LENGTH_VAL = LINK_LENGTH.getValue();

    /* Scale the chart height to fit screen size */
    $('.chart').css('height', $(window).height()/2);
  }

  // call initialization file
  if (window.File && window.FileList && window.FileReader) {
    Init();
  } else {
    alert('Your browser is outdated and currently not supported by this application.')
    return;
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }

})();