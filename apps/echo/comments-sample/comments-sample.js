(function(jQuery) {
"use strict";

var $ = jQuery;

var Comments = Echo.App.manifest("Echo.Apps.CommentsSample");

if (Echo.App.isDefined("Echo.Apps.CommentsSample")) return;

Comments.dependencies = [
	{"loaded": function() {
		return Echo.App.isDefined("Echo.StreamServer.Apps.Submit") &&
			Echo.App.isDefined("Echo.StreamServer.Apps.Stream");
	}, "url": "{config:cdnBaseURL.sdk}/streamserver.pack.js"}
];

Comments.config = {
	"appkey": "",
	"submitFormPosition": "top" // top | bottom
};

Comments.templates.topSubmitFormPosition =
	'<div class="{class:container}">' +
		'<div class="{class:submit}"></div>' +
		'<div class="{class:stream}"></div>' +
	'</div>';

Comments.templates.bottomSubmitFormPosition =
	'<div class="{class:container}">' +
		'<div class="{class:stream}"></div>' +
		'<div class="{class:submit}"></div>' +
	'</div>';

Comments.methods.template = function() {
	return this.templates[
		this.config.get("submitFormPosition") + "SubmitFormPosition"
	];
};

Comments.renderers.stream = function(element) {
	this.initComponent({
		"id": "Stream",
		"component": "Echo.StreamServer.Apps.Stream",
		"config": {
			"target": element
		}
	});
	return element;
};

Comments.renderers.submit = function(element) {
	this.initComponent({
		"id": "Submit",
		"component": "Echo.StreamServer.Apps.Submit",
		"config": {
			"target": element,
			"infoMessages": {"enabled": false},
			"plugins": [{
				"name": "FormAuth",
				"identityManager": "{config:identityManager}"
			}]
		}
	});
	return element;
};

Comments.css = ".{class:container} > div { margin-bottom: 7px; }";

Echo.App.create(Comments);

})(Echo.jQuery);
