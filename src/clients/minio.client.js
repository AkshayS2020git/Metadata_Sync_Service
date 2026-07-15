const { Client } = require("minio");

let minioClientInstance = null;

/**
 * Creates a new MinIO client.
 * Internal use only.
 */
function createMinioClient() {
  const endpoint = process.env.MINIO_ENDPOINT;
  const port = Number(process.env.MINIO_PORT ?? 9000);
  const useSSL = process.env.MINIO_USE_SSL === "true";
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error(
      "MinIO configuration is incomplete. Please configure MINIO_ENDPOINT, MINIO_ACCESS_KEY and MINIO_SECRET_KEY."
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
 *
 * @param {string} bucketName
 * @returns {Promise<boolean>}
 */
async function bucketExists(bucketName) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  const client = getMinioClient();

  return await client.bucketExists(bucketName);
}

/**
 * Lists all objects under the specified prefix.
 *
 * Example:
 * bucket: legacyruckus
 * prefix: Test_Plan/
 */
async function listObjects(bucketName, prefix = "") {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  const client = getMinioClient();

  return new Promise((resolve, reject) => {
    const objects = [];

    const stream = client.listObjects(bucketName, prefix, false);

    stream.on("data", (obj) => {
      objects.push(obj);
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("end", () => {
      resolve(objects);
    });
  });
}


/**
 * Downloads an object from MinIO and returns its contents as a UTF-8 string.
 *
 * @param {string} bucketName
 * @param {string} objectKey
 * @returns {Promise<string>}
 */



async function getObject(bucketName, objectKey) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!objectKey) {
    throw new Error("Object key is required.");
  }

  const client = getMinioClient();

  const stream = await client.getObject(bucketName, objectKey);

  return new Promise((resolve, reject) => {
    const chunks = [];

    stream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
  });
}

/**
 * Uploads a UTF-8 string to the specified object key.
 *
 * @param {string} bucketName
 * @param {string} objectKey
 * @param {string} content
 * @returns {Promise<unknown>}
 */
async function putObject(bucketName, objectKey, content) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!objectKey) {
    throw new Error("Object key is required.");
  }
  if (typeof content !== "string") {
    throw new Error("Content must be a UTF-8 string.");
  }

  const client = getMinioClient();

  await client.putObject(
    bucketName,
    objectKey,
    Buffer.from(content, "utf8")
);

return true;
}

module.exports = {
  getMinioClient,
  healthCheck,
  listBuckets,
  bucketExists,
  listObjects,
  getObject,
  putObject,
};