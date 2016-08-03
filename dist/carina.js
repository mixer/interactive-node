(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["carina"] = factory();
	else
		root["carina"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(1));
	__export(__webpack_require__(4));
	__export(__webpack_require__(2));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var socket_1 = __webpack_require__(2);
	var Carina = (function () {
	    function Carina() {
	        this.socket = new socket_1.ConstellationSocket();
	        this.waiting = {};
	    }
	    Object.defineProperty(Carina, "WebSocket", {
	        get: function () {
	            return socket_1.ConstellationSocket.WebSocket;
	        },
	        /**
	         * Set the websocket implementation.
	         * You will likely not need to set this in a browser environment.
	         * You will not need to set this if WebSocket is globally available.
	         *
	         * @example
	         * Carina.WebSocket = require('ws');
	         */
	        set: function (ws) {
	            socket_1.ConstellationSocket.WebSocket = ws;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(Carina, "Promise", {
	        get: function () {
	            return socket_1.ConstellationSocket.Promise;
	        },
	        /**
	         * Set the Promise implementation.
	         * You will not need to set this if Promise is globally available.
	         *
	         * @example
	         * Carina.Promise = require('bluebird');
	         */
	        set: function (promise) {
	            socket_1.ConstellationSocket.Promise = promise;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    /**
	     * @callback onSubscriptionCb
	     * @param {Object} data - The payload for the update.
	     */
	    /**
	     * Subscribe to a live event
	     *
	     * @param {string} slug
	     * @param {onSubscriptionCb} cb - Called each time we receive an event for this slug.
	     * @returns {Promise.<>} Resolves once subscribed. Any errors will reject.
	     */
	    Carina.prototype.subscribe = function (slug, cb) {
	        var _this = this;
	        this.socket.on("event:live", function (data) {
	            if (data.channel === slug) {
	                cb(data.payload);
	            }
	        });
	        return this
	            .waitFor("subscription:" + slug, function () {
	            return _this.socket.execute('livesubscribe', { events: [slug] });
	        })
	            .catch(function (err) {
	            _this.stopWaiting("subscription:" + slug);
	            throw err;
	        });
	    };
	    /**
	     * Unsubscribe from a live event.
	     *
	     * @param {string} slug
	     * @returns {Promise.<>} Resolves once unsubscribed. Any errors will reject.
	     */
	    Carina.prototype.unsubscribe = function (slug) {
	        this.stopWaiting("subscription:" + slug);
	        return this.socket.execute('liveunsubscribe', { events: [slug] });
	    };
	    Carina.prototype.waitFor = function (identifier, cb) {
	        if (this.waiting[identifier]) {
	            return this.waiting[identifier];
	        }
	        return this.waiting[identifier] = cb();
	    };
	    Carina.prototype.stopWaiting = function (identifier) {
	        delete this.waiting[identifier];
	    };
	    return Carina;
	}());
	exports.Carina = Carina;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var events_1 = __webpack_require__(3);
	var errors_1 = __webpack_require__(4);
	var ConstellationSocket = (function (_super) {
	    __extends(ConstellationSocket, _super);
	    function ConstellationSocket() {
	        var _this = this;
	        _super.call(this);
	        this.ready = false;
	        this.messageId = 0;
	        this.queue = [];
	        this.socket = new ConstellationSocket.WebSocket(ConstellationSocket.CONSTELLATION_URL);
	        this.rebroadcastEvent('open');
	        this.rebroadcastEvent('close');
	        this.rebroadcastEvent('message');
	        this.rebroadcastEvent('error');
	        this.on('message', function (res) { return _this.extractMessage(res); });
	        this.once('event:hello', function () {
	            _this.ready = true;
	            _this.queue.forEach(function (data) { return _this.send(data); });
	            _this.queue = [];
	        });
	    }
	    /**
	     * Send a method to the server.
	     */
	    ConstellationSocket.prototype.execute = function (method, params, id) {
	        var _this = this;
	        if (params === void 0) { params = {}; }
	        if (id === void 0) { id = this.nextId(); }
	        this.sendJson({
	            type: 'method',
	            method: method, params: params, id: id
	        });
	        return new ConstellationSocket.Promise(function (resolve, reject) {
	            var replyListener;
	            var timeout = setTimeout(function () {
	                _this.removeListener("reply:" + id, replyListener);
	                reject(new errors_1.TimeoutError("Timeout waiting for response to " + method + ": " + JSON.stringify(params)));
	            }, ConstellationSocket.REPLY_TIMEOUT);
	            _this.once("reply:" + id, replyListener = function (err, res) {
	                clearTimeout(timeout);
	                if (err) {
	                    reject(err);
	                }
	                else {
	                    resolve(res);
	                }
	            });
	        });
	    };
	    ConstellationSocket.prototype.sendJson = function (object) {
	        this.send(JSON.stringify(object));
	    };
	    ConstellationSocket.prototype.send = function (data) {
	        // If the socket has not said hello, queue the request.
	        if (!this.ready) {
	            this.queue.push(data);
	            return;
	        }
	        this.emit('send', data);
	        this.socket.send(data);
	    };
	    ConstellationSocket.prototype.nextId = function () {
	        return ++this.messageId;
	    };
	    ConstellationSocket.prototype.extractMessage = function (messageString) {
	        var message;
	        try {
	            message = JSON.parse(messageString);
	        }
	        catch (err) {
	            throw new errors_1.MessageParseError('Message returned was not valid JSON');
	        }
	        switch (message.type) {
	            case 'event':
	                this.emit("event:" + message.event, message.data);
	                break;
	            case 'reply':
	                var err = message.error ? errors_1.ConstellationError.from(message.error) : null;
	                this.emit("reply:" + message.id, err, message.result);
	                break;
	        }
	    };
	    ConstellationSocket.prototype.rebroadcastEvent = function (name) {
	        var _this = this;
	        this.socket.addEventListener(name, function (evt) {
	            switch (evt.type) {
	                case 'message':
	                    _this.emit(name, evt.data);
	                    break;
	                default:
	                    _this.emit(name, evt);
	                    break;
	            }
	        });
	    };
	    ConstellationSocket.WebSocket = typeof WebSocket === 'undefined' ? null : WebSocket;
	    ConstellationSocket.Promise = typeof Promise === 'undefined' ? null : Promise;
	    ConstellationSocket.CONSTELLATION_URL = 'wss://constellation.beam.pro';
	    ConstellationSocket.REPLY_TIMEOUT = 10000; // 10 seconds
	    return ConstellationSocket;
	}(events_1.EventEmitter));
	exports.ConstellationSocket = ConstellationSocket;


/***/ },
/* 3 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.
	
	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;
	
	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;
	
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;
	
	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;
	
	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};
	
	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;
	
	  if (!this._events)
	    this._events = {};
	
	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }
	
	  handler = this._events[type];
	
	  if (isUndefined(handler))
	    return false;
	
	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }
	
	  return true;
	};
	
	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events)
	    this._events = {};
	
	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);
	
	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];
	
	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }
	
	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.on = EventEmitter.prototype.addListener;
	
	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  var fired = false;
	
	  function g() {
	    this.removeListener(type, g);
	
	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }
	
	  g.listener = listener;
	  this.on(type, g);
	
	  return this;
	};
	
	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;
	
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');
	
	  if (!this._events || !this._events[type])
	    return this;
	
	  list = this._events[type];
	  length = list.length;
	  position = -1;
	
	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	
	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }
	
	    if (position < 0)
	      return this;
	
	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }
	
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }
	
	  return this;
	};
	
	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;
	
	  if (!this._events)
	    return this;
	
	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }
	
	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }
	
	  listeners = this._events[type];
	
	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];
	
	  return this;
	};
	
	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};
	
	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];
	
	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};
	
	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};
	
	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	
	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	
	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	
	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var BaseError = (function (_super) {
	    __extends(BaseError, _super);
	    function BaseError(message) {
	        _super.call(this, message);
	        this.message = message;
	    }
	    return BaseError;
	}(Error));
	exports.BaseError = BaseError;
	var TimeoutError = (function (_super) {
	    __extends(TimeoutError, _super);
	    function TimeoutError() {
	        _super.apply(this, arguments);
	    }
	    return TimeoutError;
	}(BaseError));
	exports.TimeoutError = TimeoutError;
	var MessageParseError = (function (_super) {
	    __extends(MessageParseError, _super);
	    function MessageParseError() {
	        _super.apply(this, arguments);
	    }
	    return MessageParseError;
	}(BaseError));
	exports.MessageParseError = MessageParseError;
	var ConstellationError;
	(function (ConstellationError) {
	    var Base = (function (_super) {
	        __extends(Base, _super);
	        function Base(code, message) {
	            _super.call(this, message);
	            this.code = code;
	        }
	        return Base;
	    }(BaseError));
	    ConstellationError.Base = Base;
	    var errors = {};
	    function from(_a) {
	        var code = _a.code, message = _a.message;
	        if (errors[code]) {
	            return new errors[code](message);
	        }
	        return new Base(code, message);
	    }
	    ConstellationError.from = from;
	    var InvalidPayload = (function (_super) {
	        __extends(InvalidPayload, _super);
	        function InvalidPayload(message) {
	            _super.call(this, 4000, message);
	        }
	        return InvalidPayload;
	    }(Base));
	    ConstellationError.InvalidPayload = InvalidPayload;
	    errors[4000] = InvalidPayload;
	    var PayloadDecompression = (function (_super) {
	        __extends(PayloadDecompression, _super);
	        function PayloadDecompression(message) {
	            _super.call(this, 4001, message);
	        }
	        return PayloadDecompression;
	    }(Base));
	    ConstellationError.PayloadDecompression = PayloadDecompression;
	    errors[4001] = PayloadDecompression;
	    var UnknownPacketType = (function (_super) {
	        __extends(UnknownPacketType, _super);
	        function UnknownPacketType(message) {
	            _super.call(this, 4002, message);
	        }
	        return UnknownPacketType;
	    }(Base));
	    ConstellationError.UnknownPacketType = UnknownPacketType;
	    errors[4002] = UnknownPacketType;
	    var UnknownMethodName = (function (_super) {
	        __extends(UnknownMethodName, _super);
	        function UnknownMethodName(message) {
	            _super.call(this, 4003, message);
	        }
	        return UnknownMethodName;
	    }(Base));
	    ConstellationError.UnknownMethodName = UnknownMethodName;
	    errors[4003] = UnknownMethodName;
	    var InvalidMethodArguments = (function (_super) {
	        __extends(InvalidMethodArguments, _super);
	        function InvalidMethodArguments(message) {
	            _super.call(this, 4004, message);
	        }
	        return InvalidMethodArguments;
	    }(Base));
	    ConstellationError.InvalidMethodArguments = InvalidMethodArguments;
	    errors[4004] = InvalidMethodArguments;
	    var SessionExpired = (function (_super) {
	        __extends(SessionExpired, _super);
	        function SessionExpired(message) {
	            _super.call(this, 4005, message);
	        }
	        return SessionExpired;
	    }(Base));
	    ConstellationError.SessionExpired = SessionExpired;
	    errors[4005] = SessionExpired;
	    var LiveUnknownEvent = (function (_super) {
	        __extends(LiveUnknownEvent, _super);
	        function LiveUnknownEvent(message) {
	            _super.call(this, 4100, message);
	        }
	        return LiveUnknownEvent;
	    }(Base));
	    ConstellationError.LiveUnknownEvent = LiveUnknownEvent;
	    errors[4100] = LiveUnknownEvent;
	    var LiveAccessDenied = (function (_super) {
	        __extends(LiveAccessDenied, _super);
	        function LiveAccessDenied(message) {
	            _super.call(this, 4101, message);
	        }
	        return LiveAccessDenied;
	    }(Base));
	    ConstellationError.LiveAccessDenied = LiveAccessDenied;
	    errors[4101] = LiveAccessDenied;
	    var LiveAlreadySubscribed = (function (_super) {
	        __extends(LiveAlreadySubscribed, _super);
	        function LiveAlreadySubscribed(message) {
	            _super.call(this, 4102, message);
	        }
	        return LiveAlreadySubscribed;
	    }(Base));
	    ConstellationError.LiveAlreadySubscribed = LiveAlreadySubscribed;
	    errors[4102] = LiveAlreadySubscribed;
	    var LiveNotSubscribed = (function (_super) {
	        __extends(LiveNotSubscribed, _super);
	        function LiveNotSubscribed(message) {
	            _super.call(this, 4103, message);
	        }
	        return LiveNotSubscribed;
	    }(Base));
	    ConstellationError.LiveNotSubscribed = LiveNotSubscribed;
	    errors[4103] = LiveNotSubscribed;
	})(ConstellationError = exports.ConstellationError || (exports.ConstellationError = {}));


/***/ }
/******/ ])
});
;
//# sourceMappingURL=carina.js.map