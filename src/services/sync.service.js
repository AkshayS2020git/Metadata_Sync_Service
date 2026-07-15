const { discoverMetadata } = require("./discovery.service");
const {
  readMetadata,
  writeMetadata,
} = require("./metadata.service");

const {
  buildExecutionMetadata,
} = require("../helpers/payload.helper");

const {
  mergeMetadata,
} = require("../helpers/metadataMerge.helper");


exports.acceptSyncRequest = (body) => {
  if (body === undefined || body === null) {
    return {
      success: false,
      message: "JSON request body is required.",
    };
  }

  if (
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return {
      success: false,
      message: "JSON request body is required.",
    };
  }

  const requiredFields = [
    "project",
    "testRun",
    "feature",
    "run",
    "label",
    "status",
    "executedBy",
    "executedAt",
  ];

  for (const field of requiredFields) {
    if (!body[field]) {
      return {
        success: false,
        message: `${field} is required.`,
      };
    }
  }

  return { success: true };
};

async function synchronizeMetadata(payload) {
  const { bucket, objectKey } = await discoverMetadata(payload);

  const existingMetadata = await readMetadata(
    bucket,
    objectKey
  );

  const executionMetadata =
    buildExecutionMetadata(payload);

  const mergedMetadata = mergeMetadata(
    existingMetadata,
    executionMetadata
  );

  await writeMetadata(
    bucket,
    objectKey,
    mergedMetadata
  );

  return {
    success: true,
    bucket,
    objectKey,
    metadata: mergedMetadata,
  };
}


exports.synchronizeMetadata = synchronizeMetadata;