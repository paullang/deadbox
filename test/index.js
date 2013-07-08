// Load modules

var Lab = require('lab');
var Hapi = require('hapi');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;

describe('deadbox', function () {

	// Note that redis needs to be running locally on 9379 with no password 
	var cacheTypes = ['memory', 'redis']; // Hapi also supports 'mongodb'

	cacheTypes.forEach(function (cacheType) {

	    it('sets and gets key value pair with default options for cacheType: ' + cacheType, function (done) {

	    	var pluginOptions = {};

	    	var serverOptions = {
	    		cache: { engine: cacheType }
	    	};

	        var server = new Hapi.Server(serverOptions);
	        server.pack.allow({ cache: true, route: true }).require('../', pluginOptions, function (err) {

	            expect(err).to.not.exist;

				var req = {
	                method: 'POST',
	                url: 'http://example.com/box',
	                payload: { key: 'catch', value: 'me if you can' }
	            };

	            server.inject(req, function (res) {
	            	expect(res.payload.message).to.equal('Your data is in the box.');

	            	var req = {
	            	    method: 'GET',
	                	url: 'http://example.com/box?key=catch'
	            	};

	            	server.inject(req, function (res) {
	            		expect(res.payload.message).to.equal('me if you can');
	            	});
	            });

	            done();
	        });
	    });

	});
});