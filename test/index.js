// Load modules

const Code = require('code');
const Lab = require('lab');
const Hapi = require('hapi');


// Declare internals

const internals = {};


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;

describe('deadbox', function () {

    const cacheTypes = ['catbox-memory']; //  also supports 'catbox-redis', 'catbox-mongodb', 'catbox-memcached', and 'catbox-riak' 

    cacheTypes.forEach(function (cacheType) {

        it('sets key value pair and can get back value with key only once with default options for cacheType: ' + cacheType, function (done) {

            const options = {
                cache: { engine: cacheType }
            };

            const server = new Hapi.Server();
            server.connection();
            server.register({register: require('../'), options: options}, function (err) {

                expect(err).to.not.exist;

                server.start(function() {

                    const req = {
                        method: 'POST',
                        url: 'http://example.com/box',
                        payload: JSON.stringify({ key: 'catch', value: 'me if you can' })
                    };

                    server.inject(req, function (res) {

                        expect(res.statusCode).to.equal(200);
                        expect(JSON.parse(res.payload).message).to.equal('Your data is in the box');

                        const req = {
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