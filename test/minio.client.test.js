const test = require('node:test');
const assert = require('node:assert/strict');

const minioClientModule = require('../src/clients/minio.client');

test('exports reusable MinIO client helpers', () => {
  assert.equal(typeof minioClientModule.createMinioClient, 'function');
  assert.equal(typeof minioClientModule.getMinioClient, 'function');
  assert.equal(typeof minioClientModule.healthCheck, 'function');
  assert.equal(typeof minioClientModule.listBuckets, 'function');
  assert.equal(typeof minioClientModule.bucketExists, 'function');
});

test('throws a clear error when MinIO config is incomplete', () => {
  assert.throws(
    () => minioClientModule.createMinioClient({ endpoint: '', accessKey: '', secretKey: '' }),
    /incomplete/i,
  );
});

test('healthCheck propagates MinIO errors', async () => {
  const client = {
    listBuckets: async () => {
      throw new Error('MinIO is unavailable');
    },
  };

  await assert.rejects(() => minioClientModule.healthCheck(client), /MinIO is unavailable/i);
});
