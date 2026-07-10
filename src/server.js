require('dotenv').config();
const http = require('http');
const app = require('./app');
const { port } = require('./config/config');

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Metadata Sync Service listening on port ${port}`);
});

module.exports = server;

const { healthCheck } = require('./clients/minio.client');

(async () => {
  try {
    await healthCheck();
    console.log('✅ Successfully connected to MinIO');
  } catch (err) {
    console.error('❌ Failed to connect to MinIO');
    console.error(err);
  }
})();