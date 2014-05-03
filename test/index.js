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

    var cacheTypes = ['catbox-memory']; //  also supports 'catbox-redis', 'catbox-mongodb', 'catbox-memcached', and 'catbox-riak' 

    cacheTypes.forEach(function (cacheType) {

        it('sets key value pair and can get back value with key only once with default options for cacheType: ' + cacheType, function (done) {

            var pluginOptions = {};

            var serverOptions = {
                cache: { engine: cacheType }
            };

            var server = new Hapi.Server('0.0.0.0', 0, serverOptions);
            server.pack.require('../', pluginOptions, function (err) {

                expect(err).to.not.exist;

                server.start(function() {

                    var req = {
                        method: 'POST',
                        url: 'http://example.com/box',
                        payload: JSON.stringify({ key: 'catch', value: 'me if you can' })
                    };

                    server.inject(req, function (res) {

                        expect(res.statusCode).to.equal(200);
                        expect(JSON.parse(res.payload).message).to.equal('Your data is in the box');

                        var req = {
                            method: 'GET',
                            url: 'http://example.com/box?key=catch'
                        };

                        server.inject(req, function (res) {

                            expect(res.statusCode).to.equal(200);
                            expect(JSON.parse(res.payload).value).to.equal('me if you can');

                            server.inject(req, function (res) {

                                expect(res.statusCode).to.equal(404);
                                expect(JSON.parse(res.payload).message).to.equal('Data not found');
                                done();
                            });
                        });
                    });

                });
            });
        });
    });
});