Ext.data.JsonP.Echo_Loader({
  "tagname": "class",
  "name": "Echo.Loader",
  "extends": null,
  "mixins": [

  ],
  "alternateClassNames": [

  ],
  "aliases": {
  },
  "singleton": false,
  "requires": [

  ],
  "uses": [

  ],
  "enum": null,
  "override": null,
  "inheritable": null,
  "inheritdoc": null,
  "meta": {
  },
  "private": null,
  "id": "class-Echo.Loader",
  "members": {
    "cfg": [

    ],
    "property": [
      {
        "name": "canvases",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-canvases"
      },
      {
        "name": "config",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-config"
      },
      {
        "name": "debug",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-debug"
      },
      {
        "name": "overrides",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-overrides"
      },
      {
        "name": "vars",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-vars"
      },
      {
        "name": "version",
        "tagname": "property",
        "owner": "Echo.Loader",
        "meta": {
          "private": true
        },
        "id": "property-version"
      }
    ],
    "method": [

    ],
    "event": [

    ],
    "css_var": [

    ],
    "css_mixin": [

    ]
  },
  "linenr": 8,
  "files": [
    {
      "filename": "loader.js",
      "href": "loader.html#Echo-Loader"
    }
  ],
  "html_meta": {
  },
  "statics": {
    "cfg": [

    ],
    "property": [

    ],
    "method": [
      {
        "name": "download",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-download"
      },
      {
        "name": "getURL",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-getURL"
      },
      {
        "name": "init",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-init"
      },
      {
        "name": "initApplication",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-initApplication"
      },
      {
        "name": "initEnvironment",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-initEnvironment"
      },
      {
        "name": "isDebug",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-isDebug"
      },
      {
        "name": "override",
        "tagname": "method",
        "owner": "Echo.Loader",
        "meta": {
          "static": true
        },
        "id": "static-method-override"
      }
    ],
    "event": [

    ],
    "css_var": [

    ],
    "css_mixin": [

    ]
  },
  "component": false,
  "superclasses": [

  ],
  "subclasses": [

  ],
  "mixedInto": [

  ],
  "parentMixins": [

  ],
  "html": "<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/loader.html#Echo-Loader' target='_blank'>loader.js</a></div></pre><div class='doc-contents'><p>Static class which implements common mechanics for resources loading,\nEcho environment establishing and Canvases initialization mechanics.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-canvases' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-canvases' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-canvases' class='name expandable'>canvases</a><span> : Array</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>[]</code></p></div></div></div><div id='property-config' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-config' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-config' class='name expandable'>config</a><span> : Object</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>{&quot;cdnBaseURL&quot;: &quot;http://cdn.echoenabled.com/&quot;, &quot;storageURL&quot;: &quot;http://s3.amazonaws.com/echo-canvases/&quot;, &quot;errorTimeout&quot;: 5000}</code></p></div></div></div><div id='property-debug' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-debug' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-debug' class='name expandable'>debug</a><span> : Boolean</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>false</code></p></div></div></div><div id='property-overrides' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-overrides' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-overrides' class='name expandable'>overrides</a><span> : Object</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'>Canvases list initialized on the page ...</div><div class='long'><p>Canvases list initialized on the page</p>\n<p>Defaults to: <code>{}</code></p></div></div></div><div id='property-vars' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-vars' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-vars' class='name expandable'>vars</a><span> : Object</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'>Canvas Apps overrides object ...</div><div class='long'><p>Canvas Apps overrides object</p>\n<p>Defaults to: <code>{&quot;state&quot;: {&quot;resources&quot;: {}, &quot;queue&quot;: []}, &quot;processing&quot;: false, &quot;syncQueue&quot;: []}</code></p></div></div></div><div id='property-version' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-property-version' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-property-version' class='name expandable'>version</a><span> : String</span><strong class='private signature' >private</strong></div><div class='description'><div class='short'> ...</div><div class='long'>\n<p>Defaults to: <code>&quot;&quot;</code></p></div></div></div></div></div><div class='members-section'><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div class='definedBy'>Defined By</div><h4 class='members-subtitle'>Static Methods</h3><div id='static-method-download' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-download' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-download' class='name expandable'>download</a>( <span class='pre'>resources, [callback], [config]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function to load the JavaScript or CSS stylesheet files in async mode. ...</div><div class='long'><p>Function to load the JavaScript or CSS stylesheet files in async mode.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>resources</span> : Array<div class='sub-desc'><p>Array of objects with the properties described below:</p>\n<ul><li><span class='pre'>url</span> : String<div class='sub-desc'><p>JavaScript or CSS stylesheet file URL.</p>\n</div></li><li><span class='pre'>loaded</span> : Function<div class='sub-desc'><p>Function used to check whether the script was loaded. This function must return\nthe boolean value which indicates whether the resource was already loaded on the\npage or not. If the resource has already been loaded - no download is performed\nand the callback is called immediately.</p>\n</div></li></ul></div></li><li><span class='pre'>callback</span> : Function (optional)<div class='sub-desc'><p>Callback function which should be called as soon as all requested files\nwere downloaded.</p>\n</div></li><li><span class='pre'>config</span> : Object (optional)<div class='sub-desc'><p>Object with configuration parameters</p>\n<ul><li><span class='pre'>errorTimeout</span> : Number<div class='sub-desc'><p>Timeout loading of resources in milliseconds, use as yepnope.errorTimeout</p>\n</div></li></ul></div></li></ul></div></div></div><div id='static-method-getURL' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-getURL' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-getURL' class='name expandable'>getURL</a>( <span class='pre'>url, [devVersion]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function to get normalized URL. ...</div><div class='long'><p>Function to get normalized URL.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>url</span> : String<div class='sub-desc'><p>JavaScript or CSS stylesheet file URL.</p>\n</div></li><li><span class='pre'>devVersion</span> : Boolean (optional)<div class='sub-desc'><p>Specifies whether function should return dev version of the file or not,\n<em>false</em> value is useful when we want to get URL to image because\nimages don't have dev versions</p>\n<p>Defaults to: <code>true</code></p></div></li></ul></div></div></div><div id='static-method-init' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-init' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-init' class='name expandable'>init</a>( <span class='pre'>[config]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function to initialize canvases on the page. ...</div><div class='long'><p>Function to initialize canvases on the page.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>config</span> : Object (optional)<div class='sub-desc'><p>Object which defines the initialization of config parameters</p>\n<ul><li><span class='pre'>canvases</span> : Mixed (optional)<div class='sub-desc'><p>Array of jQuery elements or a single jQuery element, which represents a\ncanvas target. If this param is omitted, Echo Loader will look for the\ncanvases in the DOM structure.</p>\n</div></li><li><span class='pre'>target</span> : Object (optional)<div class='sub-desc'><p>Target element where Echo Loader should look for the canvases if no\ncanvases were passed in the \"config.canvases\" field.</p>\n</div></li></ul></div></li></ul></div></div></div><div id='static-method-initApplication' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-initApplication' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-initApplication' class='name expandable'>initApplication</a>( <span class='pre'>app</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function to initialize application on the page. ...</div><div class='long'><p>Function to initialize application on the page. The function performs the following actions:</p>\n\n<ul>\n<li>initializes Echo JavaScript environment (if it was not initialized yet)</li>\n<li>establishes the Backplane connection (if app.backplane is defined)</li>\n<li>establishes Echo User session on the page (if app.config.appkey is defined)</li>\n<li>downloads the application script</li>\n<li>calls the app JavaScript class constructor which handles further application initialization</li>\n</ul>\n\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>app</span> : Object<div class='sub-desc'><p>Object which defines the base app configuration.</p>\n<ul><li><span class='pre'>component</span> : String<div class='sub-desc'><p>The name of the JavaScript app class which should be initialized.</p>\n</div></li><li><span class='pre'>script</span> : String<div class='sub-desc'><p>Appliction JavaScript class script URL.</p>\n</div></li><li><span class='pre'>scripts</span> : Object (optional)<div class='sub-desc'><p>Object which specifies the location (URL) of the production (minified) and development\n(non-minified) versions of the app JavaScript class code. The \"prod\" and \"dev\" keys\nshould be used in order to specify the production and development URLs respectively.</p>\n</div></li><li><span class='pre'>backplane</span> : Object (optional)<div class='sub-desc'><p>Object which contains the data to be passed into the Backplane.init call.</p>\n</div></li><li><span class='pre'>config</span> : Object (optional)<div class='sub-desc'><p>Parameters to be passed into the application constructor during its initialization.</p>\n</div></li></ul></div></li></ul></div></div></div><div id='static-method-initEnvironment' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-initEnvironment' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-initEnvironment' class='name expandable'>initEnvironment</a>( <span class='pre'>[callback]</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function to initialize Echo environment on the page by downloading Backplane lib,\njQuery library with the necessary d...</div><div class='long'><p>Function to initialize Echo environment on the page by downloading Backplane lib,\njQuery library with the necessary dependencies and the base Echo classes.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>callback</span> : Function (optional)<div class='sub-desc'><p>Callback function which should be called as soon as Echo environment is ready.</p>\n</div></li></ul></div></div></div><div id='static-method-isDebug' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-isDebug' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-isDebug' class='name expandable'>isDebug</a>( <span class='pre'></span> ) : Boolean<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Allows to identify if the debug mode is enabled for Echo environment\non the page (i.e whether the logs should be prin...</div><div class='long'><p>Allows to identify if the debug mode is enabled for Echo environment\non the page (i.e whether the logs should be printed in console,\nnon-minified versions of scripts should be used)</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>Boolean</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='static-method-override' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='Echo.Loader'>Echo.Loader</span><br/><a href='source/loader.html#Echo-Loader-static-method-override' target='_blank' class='view-source'>view source</a></div><a href='#!/api/Echo.Loader-static-method-override' class='name expandable'>override</a>( <span class='pre'>canvasID, appID, config</span> )<strong class='static signature' >static</strong></div><div class='description'><div class='short'>Function which provides an ability to override config parameters of the\nspecific application within the canvas. ...</div><div class='long'><p>Function which provides an ability to override config parameters of the\nspecific application within the canvas.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>canvasID</span> : String<div class='sub-desc'><p>Canvas ID.</p>\n</div></li><li><span class='pre'>appID</span> : String<div class='sub-desc'><p>Application ID inside the canvas.</p>\n</div></li><li><span class='pre'>config</span> : Object<div class='sub-desc'><p>Object with the application config overrides.</p>\n</div></li></ul></div></div></div></div></div></div></div>"
});