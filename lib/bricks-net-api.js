'use strict';

exports.URL = require('./bricks-net-url').URL;

exports.HTTPResponse = require('./bricks-net-api-types').HTTPResponse;

exports.HTTPResponseCode = require('./bricks-net-http-codes').HTTPResponseCode;
exports.HTTPResponseCodeAsString = require('./bricks-net-http-codes').HTTPResponseCodeAsString;

exports.GET = require('./bricks-net-api-types').GET;
exports.POST = require('./bricks-net-api-types').POST;
exports.POSTFromFile = require('./bricks-net-api-types').POSTFromFile;
exports.HTTP = require('./bricks-net-api-types').HTTP;

exports.KeepResponseInMemory = require('./bricks-net-api-types').KeepResponseInMemory;
exports.SaveResponseToFile = require('./bricks-net-api-types').SaveResponseToFile;