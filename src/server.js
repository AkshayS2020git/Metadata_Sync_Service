require('dotenv').config();
const http = require('http');
const app = require('./app');
const { port } = require('./config/config');

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Metadata Sync Service listening on port ${port}`);
});

module.exports = server;

