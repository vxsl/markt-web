/* eslint-disable */

(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.appLink = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
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

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function eventListener() {
      if (errorListener !== undefined) {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };
    var errorListener;

    // Adding an error listener is not optional because
    // if an error is thrown on an event emitter we cannot
    // guarantee that the actual event we are waiting will
    // be fired. The result could be a silent way to create
    // memory or file descriptor leaks, which is something
    // we should avoid.
    if (name !== 'error') {
      errorListener = function errorListener(err) {
        emitter.removeListener(name, eventListener);
        reject(err);
      };

      emitter.once('error', errorListener);
    }

    emitter.once(name, eventListener);
  });
}

},{}],3:[function(require,module,exports){
(function (global){(function (){
"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
}

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
if (global.fetch) {
	exports.default = global.fetch.bind(global);
}

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
const NUM_POSITIONS = 2
const fileDir = '../data/'
const workDir = './'
const debug = false

module.exports = {
    NUM_POSITIONS,
    fileDir,
    workDir,
    debug
}
},{}],5:[function(require,module,exports){
const { QuoteHarvester } = require("./bnnbloomberg-markets-scraper/QuoteHarvester")

class Position {
    constructor (quoteHarvester, price) {
        this.ticker = quoteHarvester.ticker
        this.quoter = quoteHarvester
        this.price = price
        this.lock = 0
    }
	
	static async build (ticker) {
		try {
            let p = await QuoteHarvester.build(ticker)
            let q = await p.quote()
            console.dir(q)
            let initPrice = q.data.stocks[0].price
            let price = {
                current:initPrice,
                history:[{value: initPrice, timestamp: Date.parse(q.generatedTimestamp).toString()}],				
                min:initPrice,
                max: initPrice,
                average:initPrice  
            }
			return new Position(p, price)
		}
		catch (error) {
			console.log(error)
			throw "...unable to instantiate a Position object for " + ticker + ".\n"
		}		
	}

    async newQuote () {
        return await this.quoter.quote()
    }
}

module.exports = {
    Position
}
},{"./bnnbloomberg-markets-scraper/QuoteHarvester":6}],6:[function(require,module,exports){
const { corsProxy } = require('./config.js')
const { QuoteLogger } = require('./QuoteLogger.js')
const { fetch, baseURI, resources, types, fetchOptions } = require('./params.js')

class QuoteHarvester {		 

	constructor (ticker, uri, firstStamp, log) {
		
		this.ticker = ticker				
		this.uri = corsProxy + uri	// corsProxy is empty by default, check config.js
		this.freshestTimestamp = firstStamp
		this.log = log
		this.invalidResponseCount = 0
		console.log("The corresponding URI is " + this.uri + ".\n")	
		log? this.logger = new QuoteLogger() : null		
	}
	
	static async build (reqResource="ca", log=false) {
		try {
			let result = new QuoteHarvester(reqResource, baseURI + await QuoteHarvester.constructURI(reqResource), 0, log)
			let firstStamp
			while (true) {
				let r = await result.quote(true)
				if (r !== 1 && Math.abs(Date.parse(r[0].generatedTimestamp) - Date.parse(r[1].get('date')).toString()) < 9000) {
					firstStamp = Date.parse(r[0].generatedTimestamp)
					break
				}
			}
			return result
		}
		catch (error) {
			console.log(error)
			throw "...unable to instantiate a QuoteHarvester for " + reqResource + ".\n"
		}		
	}

	async quote (init=false) {
		
		while (true) {
			this.log? this.logger.reqInit() : null

			let responseHeaders

			// Make API request	
			// use spoofParams() to give fake parameters to URI, increasing likelihood of getting a correct response
			let r = await fetch(QuoteHarvester.spoofParams(this.uri), fetchOptions).then(function(res) {
				responseHeaders = res.headers;
				try {
					return res.json()
				}
				catch (error) {	
					console.log(error)
					return 1	// see below block
				}
			})
			// handle invalid JSON response. Happens very occasionally, but best not to have the whole program crash if it happens once or twice.
			// If it happens more than 5 times, something is probably wrong, so at this point the program should stop.
			// At the time of writing this I have never seen that happen, but better safe than sorry.
			if (r == 1) { 
				if (++invalidResponseCount > 5) throw "The server appears to be unreliable. Halting execution."
				else continue 
			}	

			this.log? this.logger.respInit(r, responseHeaders) : null

			let newTimestamp = Date.parse(r.generatedTimestamp)
			if (newTimestamp <= this.freshestTimestamp) continue	// ignore erroneous results from the API, which are frequent
			else this.freshestTimestamp = newTimestamp

			this.log? this.logger.fin(r) : null

			if (init) return [r, responseHeaders]
			else return r
		}
	}	

	static async constructURI (reqResourceFriendly) {

		let result
		switch (reqResourceFriendly) {
			case "us":
				console.log("\nSelected option is a summary of the NASDAQ (Unfortunately NYSE data is not available from Bloomberg's API).")
				result = types.stockList
				result += resources.us.nasdaq
				console.log(result)
				break
			case "ca":
				console.log("\nSelected option is a summary of the Canadian market (TSX Composite Index, Midcap Index and Smallcap Index).")
				result = types.stockList + resources.ca.composite + "," + resources.ca.midcap + "," + resources.ca.smallcap
				break
			default:
				if (new RegExp(`$[a-z, A-Z]+\:[a-z, A-Z]+^`).test(reqResourceFriendly)) {	
					throw "\nSorry, " + reqResourceFriendly + " is not a valid resource name."
				}
				else {
					console.log("\nTrying to obtain an individual quote for \'" + reqResourceFriendly + "\'.")
					result = types.stockChart + reqResourceFriendly	
					let invalidTestResponseCount = 0
					let response
					while (invalidTestResponseCount < 5) {
						response = await fetch(corsProxy + baseURI + result, fetchOptions).then(res => res.json()).catch(error => {
								console.log(error)
								invalidTestResponseCount++
								return 1	// invalid JSON response (happens occasionally on server error)
							})
						if (response != 1) break	// ... if == 1 try again, if != 1 the test query was successful
						else if (invalidTestResponseCount == 4) throw "Sorry, the API is behaving unreliably."		
					}
					if (response.statusCode != 200) {						
						throw "\nSorry, that query was rejected by the API with error code " + response.statusCode + "."
					}
				}
		}
		return result
	}
	
	// Appends random parameter/value pair to end of URI in order to urge the data.bnn.ca to generate a new response.
	static spoofParams (uri) {
		const randomLetter = () => {
			return String.fromCharCode(97+Math.floor(Math.random() * 26))
		}
		let fakeParam = randomLetter()
		while (true) {
			if (fakeParam != 's') break
			else { fakeParam = randomLetter() }
		}
		return uri += "&" + fakeParam + "=" + randomLetter()
	}
}

module.exports = {

	QuoteHarvester
}

},{"./QuoteLogger.js":7,"./config.js":8,"./params.js":9}],7:[function(require,module,exports){
class QuoteLogger {
    
    reqInit = async () => {
        this.requestTime = (new Date).getTime()	
        this.reqLog()
    } 

    reqLog = () => {
        console.log('\n\n')
        console.log('New request in progress at ' + this.requestTime + "\n")
    }

    respInit = async (r, responseHeaders) => {
        this.responseTime = responseHeaders.get('date')	
		this.responseTimestamp = Date.parse(this.responseTime).toString()	
        this.responseGeneratedTimestamp = Date.parse(r.generatedTimestamp)
        this.respLog(r, responseHeaders)
    }

    respLog = (r, responseHeaders) => {
        console.log(responseHeaders.get('x-vcache'))
        if (responseHeaders.get('Set-Cookie') != null) {
            console.log("New cookie")
        }

        console.log("Received server response at " + this.responseTime)
        console.log("Difference between generated stamp and actual = " + (this.responseGeneratedTimestamp - this.responseTimestamp))

        if (Math.abs(Date.parse(r.generatedTimestamp) - Date.parse(responseHeaders.get('date')).toString()) > 2000) console.log("\nFAIL\n");
    }

    fin = async (r) => {
        console.log("[ " + r.generatedTimestamp + " ]")
        if (r.statusCode != '200') {
            console.log(r.statusCode)
        }	
    }
}

module.exports = {

    QuoteLogger
}
},{}],8:[function(require,module,exports){
const corsProxy = "https://kylegrimsrudma.nz:8081/"    // for using bnnbloomberg-markets-scraper in a browser, you must pass your requests through a CORS proxy. See https://github.com/Rob--W/cors-anywhere

module.exports = {
    corsProxy
}
},{}],9:[function(require,module,exports){
const fetch = require('node-fetch')
const Headers = fetch.Headers;

const baseURI = 'https://data.bnn.ca/dispenser/hydra/dapi/'

const types = {    
    "stockList":"stockList?s=",     // list of current quotes for individual stocks
    "stockChart":"stockChart?s=",   // current quote for one individual stock    
    "stock":"quote/summary?s="      // historical data for one individual stock
}

const resources = {
    "us": {
        "nasdaq":"CCMPDL:IND",		//NASDAQ
        "sp500":"SPX:IND",			//S&P 500        
        "dow30": {  // DOW 30 (as of October 10, 2020)
            "industrials":"BA:US,+CAT:US,+DOW:UN,+HON:UN,+MMM:US,+UTX:US",
            "tech":"BAPL:US,+IBM:US,+INTC:US,+MSFT:US,+CSCO:US,+CRM:UN",
            "consumer":"AD:US,+WMT:UN,+DIS:UN,+MCD:US,+NKE:US,+VZ:US,+KO:US",
            "financials":"HXP:US,+GS:UN,+JPM:UN,+TRV:US,+V:US",
            "healthcare":"AMGN:UW,+JNJ:US,+MRK:US,+PG:US,+UNH:US,+WBA:UN",
            "energy":"AVX:US",
        }
    },    
    "ca": {
        "composite":"SPTSX:IND",    // TSX Composite Index 
        "midcap":"SPTSXM:IND",      // TSX Midcap Index 
        "smallcap":"SPTSXS:IND",    // TSX Smallcap Index
        "venture":"SPTSXVEN:IND"    // TSX Venture Index
    }
}

var requestHeaders = new Headers({
	"Host": "data.bnn.ca",
	"Connection": "keep-alive",
	"Pragma": "no-cache",
	"Cache-Control": "no-cache",
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36",
	"Accept": "*/*",
	"Origin": "https://www.bnnbloomberg.ca",
	"Sec-Fetch-Site": "cross-site",
	"Sec-Fetch-Mode": "cors",
	"Sec-Fetch-Dest": "empty",
	"Referer": "https://www.bnnbloomberg.ca/",  // this is probably the only essential header for the request to go through
	"Accept-Encoding": "gzip, deflate, br",
	"Accept-Language": "en-US,en;q=0.9,fr-CA;q=0.8,fr-FR;q=0.7,fr;q=0.6"
})

const fetchOptions = {

	method: 'GET', 
	headers: requestHeaders
}

module.exports = {
    fetch, baseURI, resources, types, fetchOptions
}
},{"node-fetch":3}],10:[function(require,module,exports){
const   // nthline = require('node-nthline'),
		child_process = require('child_process'),
        fs = require('fs'),
		config = require('../../config.js')
		
//process.chdir(config.workDir)

const threeDigitMillis = (timeString) => {
	millis = timeString.getMilliseconds().toString()
	for (let i = 0; i < (3 - millis.length); i++) {
		millis += "0"
	}
	return millis
}

const replaceNthLine = (n, message) => {
	let filename = config.fileDir + "refreshLog"		
	child_process.execSync(`sed -i ` + (n+1) + `'s/.*/` + message + `/' ` + filename)
	// TODO use something other than a system tool...
	// if we are going to use sed, at least make it so the nth line doesn't have to exist in order to write the line
}

const epochToTimeString = (epochString) => {
	let d = new Date(parseInt(epochString))
	let m = threeDigitMillis(d)
	return d.toLocaleTimeString().replace(" PM", ":" + m +" PM").replace(" AM", ":" + m +" AM")
}

// special fn to avoid writing "Nothing to report..." over and over again
const refreshLog = async (index, timestamp, message, extra="") => {

	let formattedMessage = epochToTimeString(timestamp) +" => "+message+extra
	replaceNthLine(index, formattedMessage)
	
	if (config.debug) console.log(epochToTimeString(timestamp)+" => "+message+extra)
	return	
}

module.exports = {
    refreshLog
}
},{"../../config.js":4,"child_process":1,"fs":1}],11:[function(require,module,exports){
const   config = require("../config.js"),
        fs = require('fs'),
		readline = require('readline')
		
//process.chdir(config.workDir)

/* const userPrompt = (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(message, ans => {
        rl.close();
        resolve(ans);
    }))
}

const safePrompt = async () => {
	while (true) {
		let userResponse = await userPrompt("Safe-ish mode? [y/n] ");
		if (userResponse === 'y' || userResponse === 'Y') {
			return true
		}
		else if (userResponse === 'n' || userResponse === 'N') {
			return false
		}
	}
} */

/**
 * delays execution of function fn until time "XX:XX". 
 * If async, return a promise.
 */
const delayFunctionCall = (fn, time, async=false) => {

    let now = new Date();
    let then = new Date(now.getFullYear(), now.getMonth(), now.getDate(), time.split(":")[0], time.split(":")[1], 0, 0)
    let msUntil = then - now;
    
    console.log("\nIt is " + now.toLocaleTimeString() + ". Waiting until " + then.toLocaleTimeString() + " to execute " + fn.name + ".")

    if (!async) {        
        setTimeout(fn, 1);
    }
    else {
        return new Promise(function(resolve, reject) {
            setTimeout(() => {
                resolve(async () => {
                    return await fn()
                })
            }, msUntil);
        });
    }
}


const writeJSON = async (data, filename) => {
	fs.writeFile(config.fileDir+filename, JSON.stringify(data), (err) => {
		if (err != null) {
			log(err)
		}
	})
}

const log = (message) => {
	
	//fs.appendFileSync(config.fileDir+'log', message+"\n")
	if (config.debug) console.log(message) 
}


module.exports = {
    writeJSON,
    log,
	delayFunctionCall,
	//safePrompt
}
},{"../config.js":4,"fs":1,"readline":1}],12:[function(require,module,exports){
const 	config = require('../config.js'),
		tools = require('./tools/tools.js'),
		{ log } = require('../tools/tools.js'),
		{ writeJSON } = require('../tools/tools.js'),
		{ QuoteHarvester } = require("./bnnbloomberg-markets-scraper"),
		{ EventEmitter } = require("events"),
		{ Position } = require ("./Position.js")

const buySellEmitter = new EventEmitter()

var modelPositions = []

const createPosition = async (ticker) => {

	let result = await Position.build(ticker)
	return result
}

const main = async () => {
	
	//let market = await (await QuoteHarvester.build("ca")).quote()
	//console.log(market.data.stocks)
	/* let p
	// TODO there is a race condition leading to deadlock somewhere in here??
	while (true) {	
		//for (let i in modelPositions) {
		for (let i = 0; i < modelPositions.length; i++) {
			p = modelPositions[i]
			if (!p.lock) {
				p.lock = 1
				updateEvaluate(i)
			}
			else await new Promise(resolve => setTimeout(resolve, 1000));
		}
	} */
}

// TODO create some enumerable optfions here
const selectionStrategy = (market, sort="pctChng") => {
	
	log("\nSelected buying strategy: top gainers")

	switch(sort) {
		case "pctChng":
			market.sort((a, b) => b.pctChng - a.pctChng)
			break
		case "totalVolume":
			market.sort((a, b) => b.totalVolume - a.totalVolume)
			break	
	}	

	// get only cheap gainers < $7.00
	let result = []
	for (let i = 0; i < market.length; i++) {
		if (market[i].price < 7) result.push(market[i])
		if (result.length == config.NUM_POSITIONS) break
	}

	/* // get top gainers
	let result = []
	for (let i = 0; i < config.NUM_POSITIONS; i++) {
		result.push(market[i])
	} */

	if (result.length != config.NUM_POSITIONS) throw "Something went wrong selecting positions."
	
	log("\nOK, the top " + config.NUM_POSITIONS + " gainers are as follows:\n")
	return result
}

const recommendPositions = async () => {
	
	console.log("HERRE")
	log("Going to recommend " + config.NUM_POSITIONS + " positions.")
	
	// get initial market model:
	let market = await (await QuoteHarvester.build("ca")).quote()
	log("TSX market model retrieved (" + market.data.stocks.length + " stocks).\n")	
	
	let selectedStocks = selectionStrategy(market.data.stocks, "totalVolume")

	selectedStocks.forEach(s => {
		log("|\t [ " + s.symbol + " ]\t"  + s.price + "\t" + s.pctChng.toFixed(2) + "%\t\t(" + s.name + ")") 
		// it seems that every day at 9:00 EST (30 min before the opening bell), BNN Bloomberg resets the daily gain/loss stats on their "market movers." I am setting this function to run shortly before that time, so hopefully this case is avoided. 

		// TODO uncomment 
		//if (s.pctChng < 0.01) throw "BNN Bloomberg is not providing correct market data, so it is not possible to recommend positions."
	})

	for (let s in selectedStocks) {
		let p = await Position.build(selectedStocks[s].symbol, {
				current:selectedStocks[s].price,
				history:[{value: selectedStocks[s].price, timestamp: Date.parse(market.generatedTimestamp).toString()}],				
				min:selectedStocks[s].price,
				max: selectedStocks[s].price,
				average:selectedStocks[s].price 
			})
		modelPositions.push(p)
	}

	return modelPositions
}

// TODO check to make sure trade.getPositions() data is not 15 minutes behind. Maybe better to use buy confirmations?
const confirmPositions = async (actualPositions) => {

	let inconsistencies = 0

	for (let i in actualPositions) {	
		let p = actualPositions.results[i] 		
		let el, diff, s
		try {
			el = getModelPositionByTicker(p.stock.symbol)
			diff = Math.abs(p.quote.amount - el.price.average)

			s = p.stock.symbol + " was purchased for "		
			if (diff < 0) {
				s += "$" + diff + " less than expected."
				s += "\nDecreasing the model position's average price to $" + p.quote.amount 
				el.price.average = p.quote.amount
				if (el.price.average == p.quote.amount) {
					s += "\n...Success."
				} else throw "Something went wrong changing the average price for model position " + el.ticker
			}
			else if (diff > 0) {
				s += "$" + diff + " more than expected."
				s += "\nIncreasing the model position's average price to $" + p.quote.amount 
				el.price.average = p.quote.amount
				if (el.price.average == p.quote.amount) {
					s += "\n...Success."
				} else throw "Something went wrong changing the average price for model position " + el.ticker
			}
			else {
				s += " the expected price."
			}
			s? log(s) : null
		} 
		catch (error) {				
			inconsistencies++
			log("Signalling to cancel/sell " + p.stock.symbol + "...")
			buySellEmitter.emit("cancel", p.stock.symbol)
			//delete el // is this correct?
		}
	}
	
	if (inconsistencies > 0) {
		log("In comparing the position model and the actual positions on WS, " + inconsistencies + " inconsistencies were found.")
		throw inconsistencies
	}
	else {
		log("Model positions OK")
	}

		(modelPositions, "modelPositions.json")
}

const updateEvaluate = async (i) => {

	let p = modelPositions[i]
	
	let newQuote = await p.quoter.quote()
	let newTimestamp = Date.parse(newQuote.generatedTimestamp).toString()

	if (newTimestamp > p.price.history[0].timestamp) {
		tools.refreshLog(i, newTimestamp, p.ticker + ": New update.", " [" + ((Date.now() - newTimestamp) / 1000) + " seconds late]")
		let newPrice = newQuote.data.stocks[0].price		
		let currentPrice = p.price.current

		let s = ''
		
		if (currentPrice != newPrice) {
			p.price.current = newPrice
			p.price.history.unshift({value:newPrice, timestamp: newTimestamp})

			// extra stuff:
			if (newPrice < p.price.min) {
				p.price.min = newPrice
			}
			else if (newPrice > p.price.max) {
				p.price.max = newPrice
			}			
			s += (p.ticker + " ")
			s += (newPrice - currentPrice > 0) ? "jumped" : "fell"
			s += (" from " + currentPrice.toFixed(2) + " to " + newPrice.toFixed(2) + "...\n")	
		}
		
		if (currentPrice > newPrice) buySellEmitter.emit("sell", p.ticker, newPrice)
			
		s? log(s) : null
		writeJSON(modelPositions, "modelPositions.json")
	}
	else {
		tools.refreshLog(i, newTimestamp, p.ticker + ": Nothing to report...")
	}
	p.lock = 0
}

const getModelPositionByTicker = (ticker) => {
	
	let stripped = ticker.split(":")[0]
	for (p in modelPositions) {
		if (modelPositions[p].ticker == stripped) return modelPositions[p]
	}
	throw stripped + " didn't match any positions in the model. Something went wrong."
}

/*===============================
=            Misc.              = 
===============================*/

const simulateMarketAction = (quote) => {
	if (Math.random() > 0.5) {
		for (let i = 0; i < quote.data.stocks.length; i++) {
			//log(cur.data.stocks[i])
			if (Math.random() > 0.3) {
				if (Math.random() > 0.5) {
					quote.data.stocks[i].price = getStockBySymbol(quote.data.stocks[i].symbol).price + Math.random()
				} else {
					quote.data.stocks[i].price = getStockBySymbol(quote.data.stocks[i].symbol).price - Math.random()
				}
			}		
		}
	}
}

/* module.exports = {
	recommendPositions,
	confirmPositions,
	modelPositions,
	buySellEmitter,
	main,
} */

module.exports = {
	createPosition
}
},{"../config.js":4,"../tools/tools.js":11,"./Position.js":5,"./bnnbloomberg-markets-scraper":6,"./tools/tools.js":10,"events":2}]},{},[12])(12)
});
