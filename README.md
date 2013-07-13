# deadbox

Anonymous dead drop plugin for [Hapi.js] (https://npmjs.org/package/hapi "Hapi.js")

This allows an unauthenticated user to POST a single key value data pair in a cache on the interwebs so that another agent can GET it.  Once it is retrieved, they key & value are dropped from the cache so no other agents can get it.  Also, if the agent doesn't get it in the configured time, the item expires.

## Getting Started

Install **deadbox** by either running `npm install deadbox --save` in your Hapi application's working directory.

### Example usage 

```javascript
var Hapi = require('hapi');
var server = new Hapi.Server(8000, { cache: 'memory' });
var deadboxOptions = { messageForGet: 'Here is the last copy!', messageForGetNotFound: 'You are too late!', ttl: 60000 };

server.pack.allow({ cache: true, route: true }).require('deadbox', deadboxOptions, function (err) { });

server.start(function () {

    console.log('Server running at: ' + server.info.uri);
});
```

Execute the following commands to set and get a value by key

    curl http://localhost:8000/box -d "key=hello&value=world"
    curl http://localhost:8000/box?key=hello

If you try to get it again, it will no longer be there.

    curl http://localhost:8000/box?key=hello


### Notes
* See internals.defaults in lib/index.js for all the options you can override.
* deadbox requires cache & route plugin permissions to be set to true.
* This example uses Hapi's default memory cache that has can only store a limited amount of data, but Hapi also support 'redis' and 'mongodb' caching.
