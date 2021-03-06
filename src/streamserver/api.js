(function(jQuery) {
"use strict";

var $ = jQuery;

if (Echo.StreamServer && Echo.StreamServer.API) return;

if (!Echo.StreamServer) Echo.StreamServer = {};

Echo.StreamServer.API = {};

/**
 * @class Echo.StreamServer.API.Request
 * Class implements the interaction with the
 * <a href="http://echoplatform.com/streamserver/docs/rest-api/items-api/" target="_blank">Echo StreamServer API</a>
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
	var timeout = config && config.liveUpdates && config.liveUpdates.timeout || config.liveUpdatesTimeout;
	var liveUpdatesEnabled = config && config.liveUpdates && config.liveUpdates.enabled || config.recurring;

	config = $.extend(true, {
		/**
		 * @cfg {Number} [liveUpdatesTimeout] Specifies the live updates requests timeout in seconds.
		 * __Note__: this parameter is deprecated in favor of liveUpdates.polling.timeout.
		 */
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
		 * + "websockets" - transport based on the WebSockets technology
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
		 * Max connection retries for WebSockets transport. After the number of the
		 * failed connection attempts specified in this parameter is reached, the
		 * WebSockets transport is considered as non-supported: the client no longer
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
		 *  + "mux"
		 *
		 * __Note__: The API endpoint "mux" allows to "multiplex" requests,
		 * i.e. use a single API call to "wrap" several requests. More information
		 * about "mux" can be found
		 * <a href="http://echoplatform.com/streamserver/docs/rest-api/other-api/mux/" target="_blank">here</a>.
		 */
		"liveUpdates": {
			"transport": "polling", // or "websockets"
			// picking up enabled value
			// for backwards compatibility
			"enabled": liveUpdatesEnabled,
			"polling": {
				// picking up timeout value
				// for backwards compatibility
				"timeout": timeout || 10
			},
			"websockets": {
				"maxConnectRetries": 3,
				"serverPingInterval": 30,
				"resetPeriod": 60,
				"maxResetsPerPeriod": 2,
				/** @ignore */
				"fallback": {
					"timeout": 10,
					"divergence": 5
				},
				/** @ignore */
				"waitingForConnection": 5,
				"URL": "{%=baseURLs.api.ws%}/v1/"
			}
		},

		/**
		 * @cfg {Boolean} [recurring] Specifies that the live updates are enabled.
		 * __Note__: this parameter is deprecated in favor of liveUpdates.enabled
		 */
		"recurring": false,

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
		"submissionProxyURL": "https:{%=baseURLs.api.submissionproxy%}/v2/esp/activity"
	}, config);
	config = this._wrapTransportEventHandlers(config);
	this.requestType = "initial"; // initial | secondary
	Echo.StreamServer.API.Request.parent.constructor.call(this, config);
});

/**
 * @method
 * Method to stop live updates requests.
 */
Echo.StreamServer.API.Request.prototype.abort = function() {
	var self = this;
	Echo.StreamServer.API.Request.parent.abort.call(this);
	if (this.liveUpdates) {
		this.liveUpdates.on("close", function() {
			delete self.liveUpdates;
		});
		this.liveUpdates.stop();
	}
};

Echo.StreamServer.API.Request.prototype._count =
Echo.StreamServer.API.Request.prototype._search = function(force) {
	var self = this;
	var start = function(data) {
		if (self.config.get("liveUpdates.enabled")) {
			if (!self.liveUpdates) {
				self._initLiveUpdates(data || {});
			}
			self.liveUpdates.start(force);
		}
		self.requestType = "secondary";
	}
	if (!this.config.get("skipInitialRequest")
		|| this.config.get("skipInitialRequest") && this.requestType !== "initial") {
		this.request().progress(start);
	} else {
		start();
	}
};

Echo.StreamServer.API.Request.prototype._submit = function() {
	this.request(
		$.extend({}, this.config.get("data"), {
			"content": Echo.Utils.objectToJSON(this._AS2KVL(this.config.get("data.content")))
		})
	);
};

Echo.StreamServer.API.Request.prototype._mux = function() {
	this.request(
		$.extend({}, this.config.get("data"), {
			"requests": Echo.Utils.objectToJSON(this.config.get("data.requests"))
		})
	);
};

Echo.StreamServer.API.Request.prototype._wrapTransportEventHandlers = function(config) {
	var self = this;
	var _config = $.extend({}, config);
	return $.extend({}, config, {
		"onOpen": function(response, requestParams) {
			_config.onOpen(response, {"requestType": self.requestType});
			clearInterval(self.retryTimer);
			delete self.retryTimer;
		},
		"onData": function(response, requestParams) {
			self._onData(response, {"requestType": self.requestType}, _config);
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
	this.requestType = "secondary";
	this._cleanupErrorHandlers(true);
};

Echo.StreamServer.API.Request.prototype._onError = function(responseError, requestParams, config) {
	this._handleErrorResponse(responseError, {"callback": config.onError});
};

Echo.StreamServer.API.Request.prototype._prepareURL = function() {
	var endpoint = this.config.get("endpoint");
	if (endpoint === "submit") {
		return this.config.get("submissionProxyURL");
	}
	var url = this.constructor.parent._prepareURL.call(this);
	return endpoint === "mux"
		// /v1/mux endpoint is deprecated so we must always use /v2/mux
		? url.replace("v1", "v2")
		: url;
};

Echo.StreamServer.API.Request.prototype._initLiveUpdates = function(data) {
	var ws, self = this;
	var polling = Echo.StreamServer.API.Polling.init(
		$.extend(true, this._getLiveUpdatesConfig("polling"), {
			"request": {
				"data": {
					"since": (data || {}).nextSince
				}
			}
		})
	);
	if (this.config.get("liveUpdates.transport") === "websockets" && Echo.API.Transports.WebSockets.available()) {
		ws = this.liveUpdates = Echo.StreamServer.API.WebSockets.init(
			$.extend(true, this._getLiveUpdatesConfig("websockets"), {
				"request": {
					"data": {
						"since": (data || {}).nextSince
					}
				}
			})
		);
		this._liveUpdatesWatcher(polling, ws);
	} else {
		this.liveUpdates = polling;
	}
};

// TODO: more general logic for forwarding config parameters
Echo.StreamServer.API.Request.prototype._getLiveUpdatesConfig = function(name) {
	var self = this;
	var map = {
		"polling": {
			"timeout": "liveUpdates.polling.timeout",
			"request.onOpen": "liveUpdates.onOpen",
			"request.onData": "liveUpdates.onData",
			"request.onError": "liveUpdates.onError",
			"request.onClose": "liveUpdates.onClose",
			"request.endpoint": "endpoint",
			"request.data": "data",
			"request.apiBaseURL": "apiBaseURL",
			"request.secure": "secure"
		},
		"websockets": {
			"request.onOpen": "liveUpdates.onOpen",
			"request.onData": "liveUpdates.onData",
			"request.onError": "liveUpdates.onError",
			"request.onClose": "liveUpdates.onClose",
			"request.endpoint": "endpoint",
			"request.data": "data",
			"request.secure": "secure",
			"request.apiBaseURL": "liveUpdates.websockets.URL",
			"resubscribe.resetPeriod": "liveUpdates.websockets.resetPeriod",
			"resubscribe.maxResetsPerPeriod": "liveUpdates.websockets.maxResetsPerPeriod",
			"request.settings.maxConnectRetries": "liveUpdates.websockets.maxConnectRetries",
			"request.settings.serverPingInterval": "liveUpdates.websockets.serverPingInterval",
			"request.settings.closeSocketTimeout": "liveUpdates.websockets.closeSocketTimeout"
		}
	};

	var mapped = Echo.Utils.foldl({}, map[name], function(from, acc, to) {
		var value = function fetch(key) {
			var val = self.config.get(key);
			if (typeof val === "undefined" && key) {
				return fetch(key.split(".").slice(1).join("."));
			}
			return val;
		}(from);
		Echo.Utils.set(acc, to, value);
	});
	return mapped;
};

Echo.StreamServer.API.Request.prototype._liveUpdatesWatcher = function(polling, ws) {
	var self = this;
	var config = this.config.get("liveUpdates.websockets");
	var switchTo = function(inst) {
		return function() {
			if (self.liveUpdates.connected()) {
				self.liveUpdates.stop();
			}
			self.liveUpdates = inst;
			self.liveUpdates.start();
		}
	};
	var fallbackTimeout, waitingForConnectionTimeout;
	ws.on("close", function() {
		var timeout, fallback = config.fallback;
		clearTimeout(waitingForConnectionTimeout);
		if (self.liveUpdates && self.liveUpdates.closeReason !== "abort") {
			timeout = Echo.Utils.random(
				fallback.timeout - fallback.divergence,
				fallback.timeout + fallback.divergence
			) * 1000;
			fallbackTimeout = setTimeout(function() {
				switchTo(polling)();
			}, timeout);
		}
	});
	// TODO: remove it after more general approach will be implemented
	ws.on("quotaExceeded", switchTo(polling));
	waitingForConnectionTimeout = setTimeout(function() {
		clearTimeout(fallbackTimeout);
		switchTo(polling)();
	}, config.waitingForConnection * 1000);
	if (ws.connected()) {
		clearTimeout(waitingForConnectionTimeout);
		return;
	}
	ws.on("open", function() {
		if (!(self.liveUpdates instanceof Echo.StreamServer.API.WebSockets)) {
			switchTo(ws)();
		}
		clearTimeout(waitingForConnectionTimeout);
	});
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
			var update = function(data) {
				if (!self.liveUpdates) {
					self._initLiveUpdates(data);
				}
				self.liveUpdates.start();
			};
			if (self.requestType === "initial") {
				self.request().progress(update);
			} else {
				update();
			}
		}, timeout);
		errorCallback(data, {
			"requestType": self.requestType,
			"critical": false,
			"retryIn": timeout
		});
	} else {
		this.waitingTimeoutStep = 0;
		if (this.liveUpdates) {
			this.liveUpdates.stop();
		}
		errorCallback(data, {
			"requestType": self.requestType,
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

//
// Echo.StreamServer.API.Polling definition
// Implements a machinery for the polling live updates
//

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
	// TODO: more sophisticated logic to classify reasons for closing the connection
	// parameter which indicates the reason why connection was closed.
	// "unknown" - server or client close the connection by unknown reason
	// "reconnect" - client close the connection in case of reconnect action
	// "abort" - client close the connection in case of the connection abortion
	// "server_overload" - close the connection to not load the server
	this.closeReason = "unknown"; // "unknown" | "reconnect" | "abort" | "server_overload"
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
				self.config.set("request.data.since", response.nextSince);
				self.start();
			}
			onData(response);
		}
	});
	return new Echo.API.Request(config);
};

Echo.StreamServer.API.Polling.prototype.stop = function() {
	clearTimeout(this.timers.regular);
	this.closeReason = "abort";
	this.requestObject.abort();
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
			"since": self.config.get("request.data.since")
		});
	}, timeout * 1000);
};

Echo.StreamServer.API.Polling.prototype.on = function(event, fn) {
	var event = "on" + Echo.Utils.capitalize(event);
	var handler = this.requestObject.transport.config.get(event, $.noop);
	this.requestObject.transport.config.set(event, function() {
		handler.apply(null, arguments);
		fn.apply(null, arguments);
	});
};

// in case of using polling we decide that
// client is connected wherever this function called
Echo.StreamServer.API.Polling.prototype.connected = function() {
	return true;
};

Echo.StreamServer.API.Polling.prototype._changeTimeout = function(data) {
	var self = this;
	if (typeof data === "string") {
		data = {"liveUpdatesTimeout": data};
	}
	data.liveUpdatesTimeout = parseInt(data.liveUpdatesTimeout);
	var applyServerDefinedTimeout = function(timeout) {
		if (!timeout && self.originalTimeout !== self.config.get("timeout")) {
			self.config.set("timeout", self.originalTimeout);
		} else if (timeout && timeout > self.config.get("timeout")) {
			self.config.set("timeout", timeout);
		}
	};
	var hasNewData = function(data) {
		// for "v1/search" endpoint at the moment
		return !!(data.entries && data.entries.length);
	};
	if (!this.config.get("request.data.since")) {
		applyServerDefinedTimeout(data.liveUpdatesTimeout);
		return;
	}
	var currentTimeout = this.config.get("timeout");
	var since = parseInt(this.config.get("request.data.since"));
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

//
// Echo.StreamServer.API.WebSockets definition
// Implements a machinery for the live updates via WebSockets
//
Echo.StreamServer.API.WebSockets = Echo.Utils.inherit(Echo.StreamServer.API.Polling, function(config) {
	this.config = new Echo.Configuration(config, {
		"resubscribe": {
			"maxResetsPerPeriod": 2,
			"resetPeriod": 60 // sec
		},
		"request": {
			"apiBaseURL": "{%=baseURLs.api.ws%}/v1/",
			"transport": "websockets",
			"timeout": null,
			"onOpen": $.noop,
			"onData": $.noop,
			"onError": $.noop,
			"onClose": $.noop,
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
	this.queue = [];
	this.subscribed = false;
	this.closeReason = "unknown";
	this.subscriptionResets = {
		"count": 0,
		"time": (new Date()).getTime()
	};
	this.requestObject = this.getRequestObject();
	if (this.requestObject && this.connected()) {
		this.requestObject.config.get("onOpen")();
	}
});

Echo.StreamServer.API.WebSockets.prototype.getRequestObject = function() {
	var self = this;
	var config = this.config.get("request");
	var _config = $.extend({}, config, {
		"onData": function(response) {
			if (!response || !response.event) return;
			if (!!~response.event.indexOf("failed")) {
				// TODO: more general approach here
				if (response.errorCode === "quota_exceeded") {
					self.closeReason = "server_overload";
					self.requestObject.transport.publish("onQuotaExceeded");
				} else {
					config.onError(response, {
						"critical": false
					});
				}
				return;
			}
			if (!!~response.event.indexOf("reset")) {
				self.subscribed = false;
				if (response.data && response.data.nextSince) {
					self.config.set("request.data.since", response.data.nextSince);
				}
				if (self._resubscribeAllowed()) {
					self._updateConnection(self._resubscribe);
				} else {
					self.closeReason = "server_overload";
					self.requestObject.transport.publish("onClose");
				}
				return;
			}
			if (response.event === "subscribe/confirmed") {
				self.subscribed = true;
				self._runQueue();
			}
			if (response.event === "unsubscribe/confirmed") {
				self.subscribed = false;
			}
			if (response.data) {
				if (response.data.nextSince) {
					self.config.set("request.data.since", response.data.nextSince);
				}
				config.onData(response.data);
			}
		},
		"onOpen": function() {
			self.subscribe();
			config.onOpen.apply(null, arguments);
		},
		"onError": function(event) {
			self.closeReason = "unknown";
			self.requestObject.transport.publish("onClose");
			config.onError(event, {
				"critical": false
			});
		}
	});
	return new Echo.API.Request(_config);
};

Echo.StreamServer.API.WebSockets.prototype.on = function(event, fn, params) {
	var id = this.requestObject.transport.subscribe(
		"on" + Echo.Utils.capitalize(event), {
			"handler": fn
		}
	);
	return id;
};

Echo.StreamServer.API.WebSockets.prototype.start = $.noop;

Echo.StreamServer.API.WebSockets.prototype.connected = function() {
	return this.requestObject.transport.connected();
};

Echo.StreamServer.API.WebSockets.prototype.stop = function() {
	var self = this;
	this.closeReason = "abort";
	if (this.connected()) {
		this.queue.push(function() {
			if (self.subscribed) {
				self.requestObject.request({"event": "unsubscribe/request"});
			}
			self.requestObject.abort();
		});
		this._runQueue();
	}
};

Echo.StreamServer.API.WebSockets.prototype.subscribe = function() {
	var data = {"method": this.config.get("request.wsMethod")};
	this.requestObject.request({
		"event": "subscribe/request",
		"data": $.extend(data, this.config.get("request.data"))
	});
};

// private interface

Echo.StreamServer.API.WebSockets.prototype._updateConnection = function(callback) {
	var self = this;
	callback = callback || $.noop;
	// we should update view on server-side without since parameter
	var data = $.extend(true, {}, this.config.get("request.data"));
	delete data.since;
	var req = new Echo.API.Request({
		"endpoint": "search",
		"data": data,
		"secure": this.config.get("request.secure"),
		"onData": function() {
			callback.apply(self, arguments);
		},
		"onError": function() {
			self.closeReason = "unknown";
			self.requestObject.transport.publish("onClose");
		}
	});
	req.request();
};

Echo.StreamServer.API.WebSockets.prototype._reconnect = function() {
	var self = this;
	var closeHandler = function() {
		self.requestObject = self.getRequestObject();
		if (self.connected()) {
			self.requestObject.config.get("onOpen")();
		}
	};
	this.closeReason = "reconnect";
	this.requestObject.abort();
	if (this.requestObject.transport.closing()) {
		var id = this.on("close", function() {
			closeHandler();
			Echo.Events.unsubscribe({"handlerId": id});
		});
	} else {
		closeHandler();
	}
};

Echo.StreamServer.API.WebSockets.prototype._resubscribe = function() {
	var self = this;
	var closeHandler = function() {
		if (self.connected()) {
			self.requestObject.config.get("onOpen")();
		}
	};
	if (this.requestObject.transport.closing()) {
		var id = this.on("close", function() {
			closeHandler();
			Echo.Events.unsubscribe({"handlerId": id});
		});
	} else {
		closeHandler();
	}
};

Echo.StreamServer.API.WebSockets.prototype._resubscribeAllowed = function() {
	var last = this.subscriptionResets;
	var now = (new Date()).getTime();
	var config = this.config.get("resubscribe");
	var diff = Math.floor((now - last.time) / 1000);
	if (diff > config.resetPeriod) {
		this.subscriptionResets = {
			"count": 0,
			"time": (new Date()).getTime()
		};
		return true;
	}
	if (diff <= config.resetPeriod) {
		if (last.count + 1 <= config.maxResetsPerPeriod) {
			this.subscriptionResets = {
				"count": last.count + 1,
				"time": (new Date()).getTime()
			};
			return true;
		} else {
			return false;
		}
	}
};

Echo.StreamServer.API.WebSockets.prototype._runQueue = function() {
	while (this.queue.length) {
		this.queue.shift().call(this);
	}
};

// static interface

$.map(["WebSockets", "Polling"], function(name) {
	Echo.StreamServer.API[name].init = function(config) {
		return new Echo.StreamServer.API[name](config);
	};
});

})(Echo.jQuery);
