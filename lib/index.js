// Load modules

var Hoek = require('hoek');

// Declare internals

var internals = {};

// Declare defaults

internals.defaults = {
	path: '/box',
	segment: 'token',
	ttl: 3600000, // 1 hour
	minKey: 1,
	maxKey: 100,
	minValue: 1,
	maxValue: 100,
	minTtl: 1,
	maxTtl: 999999999,
	messageForSet: 'Your data is in the box.',
	messageForSetIncludeTtl: true,
	messageForGetNotFound: 'Data not found',
	messageForGet: 'Here is your data',
	messageForGetFailedDrop: 'Here is your data, but drop failed'
};

// See https://github.com/spumko/hapi/blob/master/docs/Reference.md#plugin-interface

exports.register = function (plugin, options, next) {

	var Hapi = plugin.hapi;
	var settings = Hoek.applyToDefaults(internals.defaults, options);
	var cache = plugin.cache({ expiresIn: settings.ttl });

	var getCacheKey = function (request) {

		return { segment: settings.segment, id: request.payload.key };
	}

	// Store a key & value from the payload in the cache for a limited time

	var setKey = {
		handler: function (request) {

			var ttl = request.payload.ttl || settings.ttl;
			cache.set(getCacheKey(request), request.payload.value, settings.ttl, function (err) {

				if (err) {
					request.reply(Hapi.error.internal(err));
				} else {
					var msg = settings.messageForSet + (settings.messageForSetIncludeTtl ? ' (' + ttl + 'ms)' : '');
					request.reply({ message: msg });
				}
			});
		},
		validate: { 
			payload: { 
				key: Hapi.types.String().required().min(settings.minKey).max(settings.maxKey), 
				value: Hapi.types.String().required().min(settings.minValue).max(settings.maxValue),
				ttl: Hapi.types.Number().integer().min(settings.minTtl).max(settings.maxTtl).optional()
			} 
		}
	};

	// Get the value from the cache using the key from the payload and drop key once the first recipient retrieves it

	var getAndDropKey = {
		handler: function (request) {

			var cacheKey = getCacheKey(request);
			cache.get(cacheKey, function (err, cached) {

				if (err || !cached) {
					request.reply(Hapi.error.notFound(settings.messageForGetNotFound));
				} else {
					cache.drop(cacheKey, function (err) {

						var message = err ? settings.messageForGetFailedDrop : settings.messageForGet;
						request.reply({ value: cached });
					});
				}
			});
		},
		validate: { query: { key: Hapi.types.String().required().min(settings.minKey).max(settings.maxKey) } }
	};

	// Add the two routes

    plugin.route([ 
    	{ method: 'POST', path: settings.path, config: setKey },
    	{ method: 'GET',  path: settings.path, config: getAndDropKey }
    ]);

    next();
};