/**
 * require config file for bower, components, which is in part auto-genearted by bower-require.js, when you run the npm install script, postinstall is automatically called
 * NOTE: the shim is still hand written, to resove dependacies with requirejs
 */
require.config({
  baseUrl: "./",
  paths: {
    BigVideo: "../bower/BigVideo.js/lib/bigvideo",
    "background-video": "../bower/background-video/jquery.backgroundvideo",
    bloodhound: "../bower/bloodhound/src/bloodhound",
    mustache_template: "../bower/bloodhound/src/bloodhound/adapters/mustache_template",
    mustache_view_provider: "../bower/bloodhound/src/bloodhound/view_providers/mustache_view_provider",
    simple_template_view_provider: "../bower/bloodhound/src/bloodhound/view_providers/simple_template_view_provider",
    dynamic_view_resolver: "../bower/bloodhound/src/bloodhound/view_resolvers/dynamic_view_resolver",
    embedded_view_resolver: "../bower/bloodhound/src/bloodhound/view_resolvers/embedded_view_resolver",
    dynamic_rendering_engine: "../bower/bloodhound/src/bloodhound/rendering_engines/dynamic_rendering_engine",
    embedded_rendering_engine: "../bower/bloodhound/src/bloodhound/rendering_engines/embedded_rendering_engine",
    bootstrap: "../bower/bootstrap/dist/js/bootstrap",
    imagesloaded: "../bower/imagesloaded/imagesloaded",
    jquery: "../bower/jquery/jquery",
    "jquery.cookie": "../bower/jquery.cookie/jquery.cookie",
    "jquery.hotkeys": "../bower/jquery.hotkeys/jquery.hotkeys",
    "jquery.template": "../bower/jquery.template/jquery.template",
    masonry: "../bower/masonry/masonry",
    modernizr: "../bower/modernizr/modernizr",
    "moment-timezone": "../bower/moment-timezone/builds/moment-timezone-with-data-2010-2020",
    promise: "../bower/promise/promise",
    requirejs: "../bower/requirejs/require",
    typeahead: "../bower/typeahead.js/dist/typeahead.bundle",
    underscore: "../bower/underscore/underscore",
    "jquery-backstretch": "../bower/jquery-backstretch/jquery.backstretch",
    "jquery.panzoom": "../bower/jquery.panzoom/dist/jquery.panzoom",
    async: "../bower/async/lib/async",
    "bootstrap-toggle": "../bower/bootstrap-toggle/js/bootstrap-toggle.min",
    dropzone: "../bower/dropzone/dist/min/dropzone.min",
    fontawesome: "../bower/fontawesome/fonts/*",
    purl: "../bower/purl/purl"
  },
  shim: {
    typeahead: {
      deps: [
        "jquery"
      ],
      exports: "Typeahead"
    },
    bloodhound: {
      deps: [
        "jquery"
      ],
      exports: "Bloodhound"
    },
    underscore: {
      exports: "_"
    },
    "jquery.panzoom": [
      "jquery"
    ]
  },
  packages: [

  ]
});
