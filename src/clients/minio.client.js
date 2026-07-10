const { Client } = require('minio');

let minioClientInstance = null;

/**
 * Creates a new MinIO client.
 */
function createMinioClient(config = {}) {
  const endpoint = config.endpoint ?? process.env.MINIO_ENDPOINT;
  const port = Number(config.port ?? process.env.MINIO_PORT ?? 9000);
  const useSSL = config.useSSL ?? process.env.MINIO_USE_SSL === 'true';
  const accessKey = config.accessKey ?? process.env.MINIO_ACCESS_KEY;
  const secretKey = config.secretKey ?? process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      'MinIO configuration is incomplete. Please configure MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY.'
    );
  }

  return new Client({
    endPoint: endpoint,
    port,
    useSSL,
    accessKey,
    secretKey,
  });
}

/**
 * Returns the singleton MinIO client.
 */
function getMinioClient(config = {}) {
  if (!minioClientInstance) {
    minioClientInstance = createMinioClient(config);
  }

  return minioClientInstance;
}

/**
 * Verifies connectivity to MinIO.
 */
async function healthCheck(client = getMinioClient()) {
  await client.listBuckets();

  return true;
}

/**
 * Lists all buckets accessible to the configured service account.
 */
async function listBuckets(client = getMinioClient()) {
  return await client.listBuckets();
}

/**
 * Checks whether a bucket exists.
 * @param {string} bucketName
 * @returns {Promise<boolean>}
 */
async function bucketExists(bucketName, client = getMinioClient()) {
  if (!bucketName) {
    throw new Error('Bucket name is required.');
  }

  return await client.bucketExists(bucketName);
}

module.exports = {
  createMinioClient,
  getMinioClient,
  healthCheck,
  listBuckets,
  bucketExists,
};