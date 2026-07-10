const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('GET /health returns healthy service response', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: 'healthy',
    service: 'Metadata Sync Service',
  });
});

test('POST /sync accepts a JSON body', async () => {
  const response = await request(app)
    .post('/sync')
    .send({ source: 'test' });

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, {
    status: 'received',
    message: 'Synchronization request accepted.',
  });
});
