const Hapi = require('hapi');
const server = new Hapi.Server();
server.connection({ port: 8000 });
const deadboxOptions = { messageForGet: 'Here is the last copy!', messageForGetNotFound: 'You are too late!', ttl: 60000 };

server.register({register: require('../'), options: deadboxOptions}, function (err) { });

server.start(function () {
  console.log('Server running at: ' + server.info.uri + '\n');
  console.log('Execute the following commands to set and get a value by key');
  console.log('curl ' + server.info.uri + '/box -d \"key=hello&value=world\"');
  console.log('curl ' + server.info.uri + '/box?key=hello');
  console.log('If you try to get it again, it will no longer be there.');
  console.log('curl ' + server.info.uri + '/box?key=hello');
});