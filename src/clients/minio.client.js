const { Client } = require('minio');

let minioClientInstance = null;

/**
 * Creates a new MinIO client.
 * This function is private and should only be used internally.
 */
function createMinioClient() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const port = Number(process.env.MINIO_PORT ?? 9000);
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

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
function getMinioClient() {
  if (!minioClientInstance) {
    minioClientInstance = createMinioClient();
  }

  return minioClientInstance;
}

/**
 * Verifies connectivity to MinIO.
 */
async function healthCheck() {
  const client = getMinioClient();

  await client.listBuckets();

  return true;
}

/**
 * Lists all buckets accessible to the configured service account.
 */
async function listBuckets() {
  const client = getMinioClient();

  return await client.listBuckets();
}

/**
 * Checks whether a bucket exists.
 * @param {string} bucketName
 * @returns {Promise<boolean>}
 */
async function bucketExists(bucketName) {
  if (!bucketName) {
    throw new Error('Bucket name is required.');
  }

  const client = getMinioClient();

  return await client.bucketExists(bucketName);
}

module.exports = {
  getMinioClient,
  healthCheck,
  listBuckets,
  bucketExists,
};