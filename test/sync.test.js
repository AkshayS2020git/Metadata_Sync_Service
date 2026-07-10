const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const minioClient = require('../src/clients/minio.client');

test('GET /health returns healthy service response when MinIO is reachable', async () => {
  const originalHealthCheck = minioClient.healthCheck;
  minioClient.healthCheck = async () => true;

  try {
    const response = await request(app).get('/health');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      status: 'healthy',
      service: 'Metadata Sync Service',
      minio: {
        available: true,
      },
    });
  } finally {
    minioClient.healthCheck = originalHealthCheck;
  }
});

test('GET /buckets returns accessible bucket names', async () => {
  const originalListBuckets = minioClient.listBuckets;
  minioClient.listBuckets = async () => [{ name: 'alpha' }, { name: 'beta' }];

  try {
    const response = await request(app).get('/buckets');

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, {
      count: 2,
      buckets: ['alpha', 'beta'],
    });
  } finally {
    minioClient.listBuckets = originalListBuckets;
  }
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
