# deadbox

[![Build Status](https://travis-ci.org/paullang/deadbox.png)](https://travis-ci.org/paullang/deadbox)

Anonymous dead drop plugin for [Hapi.js] (https://npmjs.org/package/hapi "Hapi.js")

This allows an unauthenticated user to POST a single key value data pair in a cache on the interwebs so that another agent can GET it.  Once it is retrieved, they key & value are dropped from the cache so no other agents can get it.  Also, if the agent doesn't get it in the configured time, the item expires.

## Getting Started

Install **deadbox** by running `npm install deadbox --save` in your Hapi application's working directory.

### Example usage 

Example included in [examples/index.js](https://github.com/paullang/deadbox/blob/master/examples/index.js) and you can run it with:

    node ./examples

Execute the following commands to set and get a value by key

    curl http://localhost:8000/box -d "key=hello&value=world"
    curl http://localhost:8000/box?key=hello

If you try to get it again, it will no longer be there.

    curl http://localhost:8000/box?key=hello


### Notes
* See internals.defaults in lib/index.js for all the options you can override.
* deadbox requires cache & route plugin permissions to be set to true.
* This example uses Hapi's default memory cache that can only store a limited amount of data, but Hapi also supports caching to Redis, MongoDB, and [more listed here](https://github.com/hapijs/catbox#installation).
