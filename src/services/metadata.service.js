const { getObject, putObject } = require("../clients/minio.client");

/**
 * Reads and parses a metadata.json file.
 */
async function readMetadata(bucketName, objectKey) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!objectKey) {
    throw new Error("Object key is required.");
  }

  const metadataContent = await getObject(
    bucketName,
    objectKey
  );

  let metadata;

  try {
    metadata = JSON.parse(metadataContent);
  } catch (err) {
    throw new Error(
      `Invalid JSON in metadata file: ${objectKey}`
    );
  }

  return metadata;
}

/**
 * Writes a metadata object back to MinIO.
 */
async function writeMetadata(bucketName, objectKey, metadata) {
  if (!bucketName) {
    throw new Error("Bucket name is required.");
  }

  if (!objectKey) {
    throw new Error("Object key is required.");
  }

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Metadata object is required.");
  }

  let json;

  try {
    json = JSON.stringify(metadata, null, 2);
  } catch (err) {
    throw new Error("Failed to serialize metadata.");
  }

  await putObject(
    bucketName,
    objectKey,
    json
  );

  return true;
}

module.exports = {
  readMetadata,
  writeMetadata,
};