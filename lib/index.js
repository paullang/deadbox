const Utils = require('hoek');
const Joi = require('joi');
const Boom = require('boom');

// Declare internals

const internals = {};

// Declare defaults

internals.defaults = {
    path: '/box',
    ttl: 3600000, // 1 hour
    minKey: 1,
    maxKey: 100,
    minValue: 1,
    maxValue: 100,
    minTtl: 1,
    maxTtl: 999999999,
    messageForSet: 'Your data is in the box',
    replyIncludesTtl: true,
    messageForGetNotFound: 'Data not found',
    messageForGet: 'Here is your data',
    messageForGetFailedDrop: 'Here is your data, but drop failed'
};

// See http://hapijs.com/api#plugins

exports.register = function (server, options, next) {

    const settings = Utils.applyToDefaults(internals.defaults, options);
    const cache = server.cache({ expiresIn: settings.ttl });

    // Store a key & value from the payload in the cache for a limited time

    const setKey = {
        handler: function (request, reply) {

            const ttl = request.payload.ttl || settings.ttl;
            cache.set(request.payload.key, request.payload.value, ttl, function (err) {

                if (err) {
                    reply(Boom.badImplementation());
                } else {
                    const resp = { message: settings.messageForSet };
                    if (settings.replyIncludesTtl) {
                        resp.ttl = ttl;
                    }
                    reply(resp);
                }
            });
        },
        validate: { 
            payload: { 
                key: Joi.string().min(settings.minKey).max(settings.maxKey).required(),
                value: Joi.string().min(settings.minValue).max(settings.maxValue).required(),
                ttl: Joi.number().integer().min(settings.minTtl).max(settings.maxTtl).optional()
            } 
        }
    };

    // Get the value from the cache using the key from the payload and drop key once the first recipient retrieves it

    const getAndDropKey = {
        handler: function (request, reply) {

            cache.get(request.query.key, function (err, cached) {
                
                if (err || !cached) {
                    reply(Boom.notFound(settings.messageForGetNotFound));
                } else {
                    
                    cache.drop(request.query.key, function (err) {

                        const message = err ? settings.messageForGetFailedDrop : settings.messageForGet;
                        reply({ message: message, value: cached });
                    });
                }
            });
        },
        validate: { query: { key: Joi.string().min(settings.minKey).max(settings.maxKey).required() } }
    };

    // Add the two routes

    server.route([ 
        { method: 'POST', path: settings.path, config: setKey },
        { method: 'GET',  path: settings.path, config: getAndDropKey }
    ]);

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
