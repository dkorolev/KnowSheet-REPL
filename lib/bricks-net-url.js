'use strict';

var cppArguments = require('./cpp-arguments');
var cppExceptions = require('./cpp-exceptions');

var BRICKS_THROW = require('./bricks-throw');

var EmptyURLException = cppExceptions.makeCppException(cppExceptions.Exception, "EmptyURLException");
exports.EmptyURLException = EmptyURLException;


function URL() {
	var _this = this;
	
	if (!(_this instanceof URL)) {
		// HACK: Cannot use `apply` to call a constructor with the exact number of arguments.
		switch (arguments.length) {
			case 0:
				_this = new URL();
				break;
			
			case 1:
				_this = new URL(arguments[0]);
				break;
			
			case 2:
				_this = new URL(arguments[0], arguments[1]);
				break;
			
			case 3:
				_this = new URL(arguments[0], arguments[1], arguments[2]);
				break;
			
			case 4:
				_this = new URL(arguments[0], arguments[1], arguments[2], arguments[3]);
				break;
			
			default:
				// HACK: We know `URL` `cppArguments.assert` will throw on this.
				_this = new URL(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4]);
				break;
		}
		return _this;
	}
	
	
	var kDefaultScheme = "http";
	
	
	// Defaults from `URLWithoutParametersParser`.
	_this.host = "";
	_this.path = "/";
	_this.scheme = kDefaultScheme;
	_this.port = 0;
	
	// Defaults from `URLParametersExtractor`.
	_this.parameters_vector = [];
	_this.query = new QueryParameters(_this.parameters_vector);
	_this.fragment = "";
	_this.url_without_parameters = "";
	
	
	function DefaultPortForScheme(scheme) {
		// We don't really "support" other schemes yet -- D.K.
		if (scheme == "http") {
			return 80;
		}
		else if (scheme == "https") {
			return 443;
		}
		else {
			return 0;
		}
	}

	function DefaultSchemeForPort(port) {
		if (port == 80) {
			return "http";
		}
		else if (port == 443) {
			return "https";
		}
		else {
			return "";
		}
	}
	
	
	function URLWithoutParametersParser() {
		// NOTE: Using `this` from the outer scope (the `URL`).
		
		cppArguments.assert('URLWithoutParametersParser', [
			[
				cppArguments.assertion('string', 'const std::string&', 'url'),
				cppArguments.assertion('string', 'const std::string&', 'previous_scheme', cppArguments.ASSERTION_MODE_OPTIONAL),
				cppArguments.assertion('string', 'const std::string&', 'previous_host', cppArguments.ASSERTION_MODE_OPTIONAL),
				cppArguments.assertion('int', 'const int', 'previous_port', cppArguments.ASSERTION_MODE_OPTIONAL),
				function (url, previous_scheme, previous_host, previous_port) {
					if (typeof previous_scheme === 'undefined') {
						previous_scheme = kDefaultScheme;
					}
					if (typeof previous_host === 'undefined') {
						previous_host = "";
					}
					if (typeof previous_port === 'undefined') {
						previous_port = 0;
					}
					
					if (!url) {
						BRICKS_THROW(EmptyURLException());
					}
					
					_this.scheme = "";
					var offset_past_scheme = 0;
					var i = url.indexOf("://");
					if (i >= 0) {
						_this.scheme = url.substr(0, i);
						offset_past_scheme = i + 3;
					}
					
					// TODO(sompylasar): Support `http://user:pass@host:80/` in the future.
					var colon = url.indexOf(':', offset_past_scheme);
					var slash = url.indexOf('/', offset_past_scheme);
					
					if (colon < 0) { colon = url.length; }
					if (slash < 0) { slash = url.length; }
					
					_this.host = url.substr(offset_past_scheme, Math.min(colon, slash) - offset_past_scheme);
					if (!_this.host) {
						_this.host = previous_host;
					}
					
					if (colon < slash) {
						_this.port = parseInt(url.substr(colon + 1), 10);
						if (isNaN(_this.port)) {
							_this.port = 0;
						}
					}
					else {
						_this.port = previous_port;
					}
					
					if (slash >= 0) {
						_this.path = url.substr(slash);
					}
					else {
						_this.path = "";
					}
					if (!_this.path) {
						_this.path = "/";
					}
					
					if (!_this.scheme) {
						if (previous_scheme) {
							_this.scheme = previous_scheme;
						}
						else {
							_this.scheme = DefaultSchemeForPort(_this.port);
						}
					}
					
					if (_this.port === 0) {
						_this.port = DefaultPortForScheme(_this.scheme);
					}
				}
			],
			[
				cppArguments.assertion('string', 'const std::string&', 'url'),
				cppArguments.assertion(function (value) {
					return (value instanceof URL);
				}, 'const URLWithoutParametersParser&', 'previous'),
				function (url, previous) {
					URLWithoutParametersParser(url, previous.scheme, previous.host, previous.port);
				}
			]
		], arguments);
	}
	function URLWithoutParametersParser_ComposeURL() {
		var os = "";
		if (_this.host) {
			if (_this.scheme) {
				os = os + _this.scheme + "://";
			}
			os = os + _this.host;
			if (_this.port != DefaultPortForScheme(_this.scheme)) {
				os = os + ':' + _this.port;
			}
			os = os + _this.path;
			return os;
		}
		else {
			// If no host is specified, it's just the path: No need to put scheme and port.
			return _this.path;
		}
	}
	
	function URLParametersExtractor(url) {
		// NOTE: Using `this` from the outer scope (the `URL`).
		
		var pound_sign_index = url.indexOf('#');
		if (pound_sign_index >= 0) {
			_this.fragment = url.substr(pound_sign_index + 1);
			url = url.substr(0, pound_sign_index);
		}
		var question_mark_index = url.indexOf('?');
		if (question_mark_index >= 0) {
			url.substr(question_mark_index + 1).split('&').forEach(function (chunk) {
				var i = chunk.indexOf('=');
				if (i >= 0) {
					_this.parameters_vector.push({
						first: chunk.substr(0, i),
						second: chunk.substr(i + 1)
					});
				}
				else {
					_this.parameters_vector.push({
						first: chunk,
						second: ""
					});
				}
			});
			_this.parameters_vector.forEach(function (it) {
				it.first = decodeURIComponent(it.first).replace('+', ' ');
				it.second = decodeURIComponent(it.second).replace('+', ' ');
			});
			_this.query = new QueryParameters(_this.parameters_vector);
			url = url.substr(0, question_mark_index);
		}
		_this.url_without_parameters = url;
	}
	function URLParametersExtractor_ComposeParameters() {
		var composed_parameters = "";
		for (var i = 0, ic = _this.parameters_vector.length; i < ic; ++i) {
			composed_parameters += "?&".charAt(i > 0 ? 1 : 0);
			composed_parameters += encodeURIComponent(_this.parameters_vector[i].first) + '=' +
				encodeURIComponent(_this.parameters_vector[i].second);
		}
		if (_this.fragment) {
			composed_parameters += "#" + _this.fragment;
		}
		return composed_parameters;
	}
	
	
	function QueryParameters(parameters_vector) {
		var _this = this;
		
		Object.defineProperties(_this, {
			parameters_vector_: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: parameters_vector
			},
			parameters_: {
				configurable: false,
				enumerable: false,
				writable: false,
				value: {}
			}
		});
		
		parameters_vector.forEach(function (param) {
			_this.parameters_[param.first] = param.second;
		});
	}
	QueryParameters.prototype.has = function (key) {
		var _this = this;
		var retval = false;
		
		cppArguments.assert('QueryParameters', [
			[
				cppArguments.assertion('string', 'const std::string&', 'key'),
				function (key) {
					retval = (typeof _this.parameters_[key] === 'string');
				}
			]
		], arguments);
		
		return retval;
	};
	QueryParameters.prototype.get = function () {
		var _this = this;
		var retval = '';
		
		cppArguments.assert('QueryParameters', [
			[
				cppArguments.assertion('string', 'const std::string&', 'key'),
				cppArguments.assertion('string', 'const std::string&', 'default_value', cppArguments.ASSERTION_MODE_OPTIONAL),
				function (key, default_value) {
					if (typeof default_value === 'undefined') {
						default_value = '';
					}
					
					retval = (_this.has(key) ? _this.parameters_[key] : default_value);
				}
			]
		], arguments);
		
		return retval;
	};
	
	
	cppArguments.assert('URL', [
		[
			// Empty arguments. Defaults are used.
		],
		[
			cppArguments.assertion('string', 'const std::string&', 'url'),
			cppArguments.assertion('string', 'const std::string&', 'previous_scheme', cppArguments.ASSERTION_MODE_OPTIONAL),
			cppArguments.assertion('string', 'const std::string&', 'previous_host', cppArguments.ASSERTION_MODE_OPTIONAL),
			cppArguments.assertion('int', 'const int', 'previous_port', cppArguments.ASSERTION_MODE_OPTIONAL),
			function (url, previous_scheme, previous_host, previous_port) {
				if (typeof previous_scheme === 'undefined') {
					previous_scheme = kDefaultScheme;
				}
				if (typeof previous_host === 'undefined') {
					previous_host = "";
				}
				if (typeof previous_port === 'undefined') {
					previous_port = 0;
				}
				
				URLParametersExtractor(url);
				URLWithoutParametersParser(
					_this.url_without_parameters,
					previous_scheme, previous_host, previous_port
				);
			}
		],
		[
			cppArguments.assertion('string', 'const std::string&', 'url'),
			cppArguments.assertion(function (value) {
				return (value instanceof URL);
			}, 'const URLWithoutParametersParser&', 'previous'),
			function (url, previous) {
				URLParametersExtractor(url);
				URLWithoutParametersParser(
					_this.url_without_parameters,
					previous
				);
			}
		]
	], arguments);
	
	
	Object.defineProperties(_this, {
		ComposeParameters: {
			configurable: false,
			enumerable: false,
			writable: false,
			value: function () {
				return URLParametersExtractor_ComposeParameters();
			}
		},
		ComposeURL: {
			configurable: false,
			enumerable: false,
			writable: false,
			value: function () {
				return URLWithoutParametersParser_ComposeURL() + URLParametersExtractor_ComposeParameters();
			}
		}
	});
}

exports.URL = URL;
