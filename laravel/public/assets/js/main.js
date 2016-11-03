// Load modules and use them
require(['moduleData', 'moduleChart', 'nexus'], function(moduleData, moduleChart){

    // if the browser is compatible intitialize the module
    var xhr = new XMLHttpRequest();
    if (window.File && window.FileList && window.FileReader && xhr.upload) {
      moduleData.init();
    } else {
      alert('Your browser is outdated and currently not supported by this application. Please update your browser and visit this link again.');
      // @TODO: More advanced app disabling
      $('.sidebar-menu').remove();
      return;
    }

});
