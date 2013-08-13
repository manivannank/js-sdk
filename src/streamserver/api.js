(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.StreamServer && Echo.StreamServer.API) return;

if (!Echo.StreamServer) Echo.StreamServer = {};

Echo.StreamServer.API = {};

/**
 * @class Echo.StreamServer.API.Request
 * Class implements the interaction with the
 * <a href="http://wiki.aboutecho.com" target="_blank">Echo StreamServer API</a>
 *
 *     var request = Echo.StreamServer.API.request({
 *         "endpoint": "search",
 *         "data": {
 *             "q": "childrenof: http://example.com/js-sdk",
 *             "appkey": "echo.jssdk.demo.aboutecho.com"
 *         },
 *         "onData": function(data, extra) {
 *             // handle successful request here...
 *         },
 *         "onError": function(data, extra) {
 *             // handle failed request here...
 *         }
 *     });
 *
 *     request.send();
 *
 * @extends Echo.API.Request
 *
 * @package api.pack.js
 *
 * @constructor
 * Constructor initializing class using configuration data.
 *
 * @param {Object} config Configuration data.
 */
Echo.StreamServer.API.Request = Echo.Utils.inherit(Echo.API.Request, function(config) {
	var timeout = config && config.liveUpdates && config.liveUpdates.timeout;
	config = $.extend(true, {
		/**
		 * @cfg {Object} [liveUpdates]
		 * Live updating machinery configuration.
		 *
		 * @cfg {Boolean} [liveUpdates.enabled=false]
		 * Parameter to enable/disable live updates.
		 *
		 * @cfg {String} [liveUpdates.transport="polling"]
		 * Preferred live updates receiveing machinery transport.
		 * The following transports are supported:
		 *
		 * + "polling" - periodic requests to check for updates
		 * + "websockets" - transport based on the WebSocket technology
		 *
		 * If the end user's browser doesn't support the WebSockets technology,
		 * the "polling" transport will be used as a fallback.
		 *
		 * @cfg {Object} [liveUpdates.polling]
		 * Object which contains the configuration specific to the "polling"
		 * live updates transport.
		 *
		 * @cfg {Number} [liveUpdates.polling.timeout=10]
		 * Timeout between the live updates requests (in seconds).
		 *
		 * @cfg {Object} [liveUpdates.websockets]
		 * Object which contains the configuration specific to the "websockets"
		 * live updates transport.
		 *
		 * @cfg {Number} [liveUpdates.websockets.maxConnectRetries=3]
		 * Max connection retries for WebSocket transport. After the number of the
		 * failed connection attempts specified in this parameter is reached, the
		 * WebSocket transport is considered as non-supported: the client no longer
		 * tries to use the WebSockets on the page and the polling transport is used
		 * from now on.
		 *
		 * @cfg {Number} [liveUpdates.websockets.serverPingInterval=30]
		 * The timeout (in seconds) between the client-server ping-pong requests
		 * to keep the connection alive.
		 *
		 * @cfg {String} [endpoint] Specifies the API endpoint. The following endpoints are available:
		 *
		 *  + "submit"
		 *  + "search"
		 *  + "count"
		 *
		 */
		"liveUpdates": {
			"transport": "polling", // or "websockets"
			"enabled": false,
			"polling": {
				// picking up timeout value
				// for backwards compatibility
				"timeout": timeout || 10
			},
			"websockets": {
				"maxConnectRetries": 3,
				"serverPingInterval": 30,
				"URL": "ws://live.echoenabled.com/v1/"
			}
		},

		/**
		 * @cfg {Boolean} [skipInitialRequest]
		 * Flag allowing to skip the initial request but continue performing
		 * live updates requests.
		 */
		"skipInitialRequest": false,

		/**
		 * @cfg {String} [itemURIPattern]
		 * Specifies the item id pattern.
		 */
		"itemURIPattern": undefined,

		/**
		 * @cfg {Function} [onData]
		 * Callback called after API request succeded.
		 */
		"onData": function() {},

		/**
		 * @cfg {Function} [onError]
		 * Callback called after API request failed.
		 */
		"onError": function() {},

		/**
		 * @cfg {Function} [onOpen]
		 * Callback called before sending an API request.
		 */
		"onOpen": function() {},

		/**
		 * @cfg {String} [submissionProxyURL]
		 * Specifes the URL to the submission proxy service.
		 */
		"submissionProxyURL": "apps.echoenabled.com/v2/esp/activity"

	}, config);
	config = this._wrapTransportEventHandlers(config);
	Echo.StreamServer.API.Request.parent.constructor.call(this, config);
});

/**
 * @method
 * Method to stop live updates requests.
 */
Echo.StreamServer.API.Request.prototype.abort = function() {
	Echo.StreamServer.API.Request.parent.abort.call(this);
	if (this.liveUpdates) {
		this.liveUpdates.stop();
		delete this.liveUpdates;
	}
};

Echo.StreamServer.API.Request.prototype._count =
Echo.StreamServer.API.Request.prototype._search = function(force) {
	if (this.config.get("liveUpdates.enabled")) {
		if (!this.liveUpdates) {
			this._initLiveUpdates();
		}
		this.liveUpdates.start(force);
	}
	this.request();
};

Echo.StreamServer.API.Request.prototype._wrapTransportEventHandlers = function(config) {
	var self = this;
	var _config = $.extend({}, config);
	return $.extend({}, config, {
		"onOpen": function(response, requestParams) {
			_config.onOpen.call(null, response);
			clearInterval(self.retryTimer);
			delete self.retryTimer;
		},
		"onData": function(response, requestParams) {
			self._onData(response, {}, _config);
		},
		"onError": function(responseError, requestParams) {
			self._onError(responseError, requestParams, _config);
		}
	});
};

Echo.StreamServer.API.Request.prototype._onData = function(response, requestParams, config) {
	response = response || {};
	if (response.result === "error") {
		this._handleErrorResponse(response, {"callback": config.onError});
		return;
	}
	config.onData(response, requestParams);
	this._cleanupErrorHandlers(true);
	if (this.liveUpdates && response.nextSince) {
		this.liveUpdates.nextSince = response.nextSince;
	}
};

Echo.StreamServer.API.Request.prototype._onError = function(responseError, requestParams, config) {
	this._handleErrorResponse(responseError, {"callback": config.onError});
};

Echo.StreamServer.API.Request.prototype._submit = function() {
	var content = Echo.Utils.objectToJSON(this._AS2KVL(this.config.get("data.content")));
	this.request($.extend({}, this.config.get("data"), {"content": content}));
};

Echo.StreamServer.API.Request.prototype._prepareURI = function() {
	if (this.config.get("endpoint") === "submit") {
		// FIXME: move replace to API.Request lib
		return this.config.get("submissionProxyURL").replace(/^(http|ws)s?:\/\//, "");
	}
	return this.constructor.parent._prepareURI.call(this);
};

Echo.StreamServer.API.Request.prototype._initLiveUpdates = function() {
	var ws, self = this;
	var polling = this.liveUpdates = Echo.StreamServer.API.Polling.init(
		this._getLiveUpdatesConfig("polling")
	);
	if (this.config.get("liveUpdates.transport") === "websockets" && Echo.API.Transports.WebSocket.available()) {
		ws = Echo.StreamServer.API.WebSockets.init(
			this._getLiveUpdatesConfig("websockets")
		);
		this._liveUpdatesWatcher(polling, ws);
	}
};

// TODO: more general logic for forwarding config parameters
Echo.StreamServer.API.Request.prototype._getLiveUpdatesConfig = function(name) {
	var self = this;
	var map = {
		"polling": {
			"timeout": "liveUpdates.polling.timeout",
			"request.onData": "onData",
			"request.onOpen": "onOpen",
			"request.onError": "onError",
			"request.onClose": "onClose",
			"request.endpoint": "endpoint",
			"request.data": "data",
			"request.apiBaseURL": "apiBaseURL",
			"request.secure": "secure"
		},
		"websockets": {
			"request.onData": "onData",
			"request.onOpen": "onOpen",
			"request.onError": "onError",
			"request.onClose": "onClose",
			"request.endpoint": "endpoint",
			"request.data": "data",
			"request.secure": "secure",
			"request.apiBaseURL": "liveUpdates.websockets.URL",
			"request.settings.maxConnectRetries": "liveUpdates.websockets.maxConnectRetries",
			"request.settings.serverPingInterval": "liveUpdates.websockets.serverPingInterval"
		}
	};

	var mapped = Echo.Utils.foldl({}, map[name], function(from, acc, to) {
		Echo.Utils.set(acc, to, self.config.get(from));
	});
	return mapped;
};

Echo.StreamServer.API.Request.prototype._liveUpdatesWatcher = function(polling, ws) {
	var self = this;
	var switchTo = function(inst) {
		return function() {
			self.liveUpdates.stop();
			self.liveUpdates = inst;
			self.liveUpdates.start();
		}
	};
	ws.on("close", switchTo(polling));
	if (ws.connected()) {
		switchTo(ws)();
		return;
	}
	ws.on("open", switchTo(ws));
};

Echo.StreamServer.API.Request.prototype._isWaitingForData = function(data) {
	var errorCodes = [
		"busy",
		"waiting",
		"timeout",
		"view_limit",
		"view_update_capacity_exceeded",
		"connection_failure",
		"network_timeout"
	];
	return data
		&& this.config.get("endpoint") !== "submit"
		&& ~$.inArray(data.errorCode, errorCodes);
};

Echo.StreamServer.API.Request.prototype._handleErrorResponse = function(data, config) {
	var self = this;
	config = config || {};
	var errorCallback = config.callback;
	var calcWaitingTimeout = function() {
		// interval is calculated as x^2, x=[1..7]
		if (self.waitingTimeoutStep > 0) {
			if (self.waitingTimeoutStep < 7) {
				self.waitingTimeoutStep++;
			}
		} else {
			self.waitingTimeoutStep = 1;
		}
		return Math.pow(self.waitingTimeoutStep, 2) * 1000;
	};
	if (this._isWaitingForData(data)) {
		var timeout = calcWaitingTimeout();
		this.waitingTimer = setInterval(function() {
			self._cleanupErrorHandlers();
			if (!self.liveUpdates) {
				self._initLiveUpdates();
			}
			self.liveUpdates.start();
		}, timeout);
		errorCallback(data, {
			"critical": false,
			"retryIn": timeout
		});
	} else {
		this.waitingTimeoutStep = 0;
		if (this.liveUpdates) {
			this.liveUpdates.stop();
		}
		errorCallback(data, {
			"critical": data.errorCode !== "connection_aborted"
		});
	}
	this.error = data;
};

Echo.StreamServer.API.Request.prototype._cleanupErrorHandlers = function(successResponseReceived) {
	if (successResponseReceived) {
		this.waitingTimeoutStep = 0;
		delete this.error;
	}
	if (this.waitingTimer) {
		clearInterval(this.waitingTimer);
	}
};

Echo.StreamServer.API.Request.prototype._AS2KVL = function(entries) {
	var self = this;
	entries = $.isArray(entries) ? entries : [entries];
	var strip = function(value) {
		return value
			.replace("http://activitystrea.ms/schema/1.0/", "")
			.replace("http://js-kit.com/spec/e2/v1/", "");
	};
	var prepareActivity = function(activity, meta) {
		var data = {
			"avatar": activity.actor && activity.actor.avatar,
			"content": activity.object && activity.object.content,
			"markers": meta.markers ? $.trim(meta.markers) : undefined,
			"name": activity.actor && (activity.actor.name || activity.actor.title),
			"source": activity.source,
			"tags": meta.tags ? $.trim(meta.tags) : undefined,
			"title": activity.object && activity.object.title,
			"target": activity.targets[0].id,
			"verb": verb(activity),
			"type": type(activity),
			"itemURIPattern": self.config.get("itemURIPattern"),
			"author": activity.author
		};
		if (verb(activity) === "update") {
			data = {
				"verb": verb(activity),
				"target": activity.targets[0].id
			};
			$.each(activity.object, function(key, value) {
				if (key !== "objectTypes") {
					data["field"] = key;
					data["value"] = value;
					return false;
				}
			});
		} else if (/tag/.test(verb(activity))) {
			data = {
				"tags": activity.object && activity.object.content,
				"verb": verb(activity),
				"target": activity.targets[0].id
			};
		} else if (/mark/.test(verb(activity))) {
			data = {
				"markers": activity.object && activity.object.content,
				"verb": verb(activity),
				"target": activity.targets[0].id
			};
		}
		return data;
	};
	var verb = function(entry) {
		return strip(entry.verbs[0]);
	};
	var type = function(entry) {
		return entry.object && entry.object.objectTypes
			? entry.object.objectTypes[0]
			: undefined;
	};
	var post, meta = {"markers": "", "tags": ""};
	$.map(entries, function(entry) {
		if (/tag|mark/.test(verb(entry)) && /tag|marker/.test(type(entry))) {
			meta[strip(type(entry)) + "s"] = entry.object.content;
		}
		if (verb(entry) === "post") {
			post = entry;
		}
	});
	if (post) {
		return prepareActivity(post, meta);
	}
	return $.map(entries, function(entry) {
		return prepareActivity(entry, meta);
	});
};

/**
 * @static
 * Alias for the class constructor.
 * @param {Object} Configuration data.
 * @return {Object} New class instance.
 */
Echo.StreamServer.API.request = function(config) {
	return (new Echo.StreamServer.API.Request(config));
};

})(Echo.jQuery);

(function(jQuery) {
 
var $ = jQuery;


if (Echo.StreamServer.API && Echo.StreamServer.API.Polling) return;

Echo.StreamServer.API.Polling = function(config) {
	this.config = new Echo.Configuration(config, {
		"timeout": 10,
		"request": {
			"endpoint": "search",
			"onData": $.noop,
			"onOpen": $.noop,
			"onError": $.noop,
			"onClose": $.noop
		}
	});
	this.timers = {};
	this.timeouts = [];
	this.originalTimeout = this.config.get("timeout");
	this.requestObject = this.getRequestObject();
};

Echo.StreamServer.API.Polling.prototype.getRequestObject = function() {
	var self = this;
	var config = this.config.get("request");
	var onData = config.onData || $.noop;
	$.extend(config, {
		"onData": function(response) {
			if (response.type !== "error") {
				self._changeTimeout(response);
				self.nextSince = response.nextSince;
				self.start();
			}
			onData.apply(null, arguments);
		}
	});
	return new Echo.API.Request(config);
};

Echo.StreamServer.API.Polling.prototype.stop = function() {
	clearTimeout(this.timers.regular);
};

Echo.StreamServer.API.Polling.prototype.start = function(force) {
	var self = this;
	this.stop();
	if (force) {
		// if live updates requests were forced after some operation, we will
		// perform 3 attempts to get live updates: immediately, in 1 second
		// and in 3 seconds after first one
		this.timeouts = [0, 1, 3];
	}
	var timeout = this.timeouts.length
		? this.timeouts.shift()
		: this.config.get("timeout");
	this.timers.regular = setTimeout(function() {
		self.requestObject.request({
			"since": self.nextSince
		});
	}, timeout * 1000);
};

Echo.StreamServer.API.Polling.prototype.on = function(event, fn) {
	var baseEvent = "request.on" + Echo.Utils.capitalize(event);
	var handler = this.config.get(baseEvent, $.noop);
	this.config.set(baseEvent, function() {
		handler.apply(null, arguments);
		fn.apply(null, arguments);
	});
	return this;
};

Echo.StreamServer.API.Polling.prototype._changeTimeout = function(data) {
	var self = this;
	if (typeof data === "string") {
		data = {"liveUpdatesTimeout": data};
	}
	data.liveUpdatesTimeout = parseInt(data.liveUpdatesTimeout);
	var applyServerDefinedTimeout = function(timeout) {
		if (!timeout && self.originalTimeout != self.config.get("timeout")) {
			self.config.set(key, self.originalTimeout);
		} else if (timeout && timeout > self.config.get("timeout")) {
			self.config.set(key, timeout);
		}
	};
	var hasNewData = function(data) {
		// for "v1/search" endpoint at the moment
		return !!(data.entries && data.entries.length);
	};
	if (!this.nextSince) {
		applyServerDefinedTimeout(data.liveUpdatesTimeout);
		return;
	}
	var currentTimeout = this.config.get("timeout");
	var since = parseInt(this.nextSince);
	var currentTime = Math.floor((new Date()).getTime() / 1000);
	// calculate the delay before starting next request:
	//   - have new data but still behind and need to catch up - use minimum timeout
	//   - have new data but on the track - increase timeout by 1 second
	//   - have no new data - increase timeout by 2 seconds
	var timeout = hasNewData(data)
		? currentTime - since > currentTimeout
			? Math.min(3, this.originalTimeout) // timeoutMin
			: currentTimeout + 1
		: currentTimeout + 2;
	if (timeout > this.originalTimeout) {
		timeout = this.originalTimeout;
	}
	this.config.set("timeout", timeout);
	// if timeout remains the same, take server side value into account
	if (timeout === this.originalTimeout) {
		applyServerDefinedTimeout(data.liveUpdatesTimeout);
	}
};

Echo.StreamServer.API.WebSockets = Echo.Utils.inherit(Echo.StreamServer.API.Polling, function(config) {
	this.config = new Echo.Configuration(config, {
		"request": {
			"apiBaseURL": "ws://live.echoenabled.com/v1/",
			"transport": "websocket",
			"endpoint": "ws"
		}
	}, function(key, value) {
		if (key === "request") {
			var wsMethod = value.endpoint;
			return $.extend({}, value, {
				"endpoint": "ws",
				"wsMethod": wsMethod
			});
		}
		return value;
	});
	this.subscriptionIds = [];
	this.requestObject = this.getRequestObject();
});

Echo.StreamServer.API.WebSockets.prototype.getRequestObject = function() {
	var config = this.config.get("request");
	var onData = config.onData || $.noop;
	$.extend(config, {
		"onData": function(response) {
			if (!response || !response.event) return;
			onData(response.data);
		}
	}, this.config.get("request"));
	return new Echo.API.Request(config);
};

Echo.StreamServer.API.WebSockets.prototype.on = function(event, fn) {
	this.subscriptionIds.push(
		Echo.Events.subscribe({
			"topic": "Echo.API.Transports.WebSocket.on" + Echo.Utils.capitalize(event),
			"handler": fn,
			"context": this.requestObject.transport.context()
		})
	);
};

Echo.StreamServer.API.WebSockets.prototype.start = function() {
	var self = this;
	var data = {"method": this.config.get("request.wsMethod")};
	if (this.connected()) {
		return this.requestObject.request({
			"event": "subscribe/request",
			"data": $.extend(data, self.config.get("request.data"))
		});
	}
	this.on("open", function() {
		self.requestObject.request({
			"event": "subscribe/request",
			"data": $.extend(data, self.config.get("request.data"))
		});
	});
};

Echo.StreamServer.API.WebSockets.prototype.connected = function() {
	return this.requestObject.transport.connected();
};

Echo.StreamServer.API.WebSockets.prototype.stop = function() {
	this.requestObject.request({"event": "unsubscribe/request"});
	$.map(this.subscriptionIds, function(id) {
		Echo.Events.unsubscribe({"handlerId": id});
	});
	this.subscriptionIds = [];
	this.requestObject.abort();
};

$.map(["WebSockets", "Polling"], function(name) {
	Echo.StreamServer.API[name].init = function(config) {
		return new Echo.StreamServer.API[name](config);
	};
});

})(Echo.jQuery);
