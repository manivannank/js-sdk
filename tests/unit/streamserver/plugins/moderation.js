(function($) {

var plugin = "Echo.StreamServer.Apps.Stream.Item.Plugins.Moderation";

Echo.Tests.module(plugin, {
	"meta": {
		"className": plugin
	}
});

Echo.Tests.pluginRenderersTest(plugin, {
	"query": "childrenof:http://example.com/js-sdk/",
	"liveUpdates": {
		"enabled": false
	}
});

})(Echo.jQuery);
