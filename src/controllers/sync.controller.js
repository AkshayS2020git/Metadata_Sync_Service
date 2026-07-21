const syncService = require("../services/sync.service");
const minioClient = require("../clients/minio.client");
const { resolveVersion } = require("../resolvers/version.resolver");
const { discoverMetadata } = require("../services/discovery.service");
const { readMetadata } = require("../services/metadata.service");

exports.getHealth = async (req, res) => {
  try {
    await minioClient.healthCheck();

    return res.status(200).json({
      status: "healthy",
      service: "Metadata Sync Service",
      minio: {
        available: true,
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: "degraded",
      service: "Metadata Sync Service",
      minio: {
        available: false,
        error: error.message,
      },
    });
  }
};

/**
 * Temporary development endpoint.
 * Used to verify MinIO connectivity and bucket discovery.
 * Remove or secure before production deployment.
 */
exports.getBuckets = async (req, res) => {
  try {
    const buckets = await minioClient.listBuckets();

    return res.status(200).json({
      count: buckets.length,
      buckets: buckets.map((bucket) => bucket.name),
    });
  } catch (error) {
    return res.status(503).json({
      error: error.message,
    });
  }
};


exports.syncMetadata = async (req, res) => {
  const validation = syncService.acceptSyncRequest(req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: validation.message,
    });
  }

  try {
    const result = await syncService.synchronizeMetadata(req.body);

    return res.status(200).json({
      status: "success",
      message: "Metadata synchronized successfully.",
      bucket: result.bucket,
      metadataPath: result.metadataPath,
    });
  } catch (error) {
    console.error("[sync]", error);

    if (error.code === "FILE_NOT_FOUND") {
      return res.status(404).json({
        errorCode: error.code,
        message: error.message,
        metadataPath: error.metadataPath,
        invalidSegment: error.invalidSegment,
        invalidPrefix: error.invalidPrefix,
      });
    }

    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getLatestVersion = async (req, res) => {
  try {
    const version = await resolveVersion("legacyruckus");

    return res.status(200).json({
      version,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Development endpoint.
 *
 * Reads any metadata.json using query parameters.
 *
 * Example:
 * /metadata?project=Legacy%20Ruckus
 * &testRun=R750_May4_May8
 * &feature=Client%20Isolation
 * &run=Run1
 * &case_ref_id=TC_1
 */
exports.getMetadata = async (req, res) => {
  try {
    const payload = {
      project: req.query.project,
      testRun: req.query.testRun,
      feature: req.query.feature,
      run: req.query.run,
      case_ref_id: req.query.case_ref_id,
    };

    const prepared =
      await syncService.prepareMetadataSynchronization(payload);

    return res.status(200).json({
      bucket: prepared.bucket,
      metadataPath: prepared.metadataPath,
      metadata: prepared.existingMetadata,
    });
  } catch (error) {
  console.error("[sync]", error);

  if (error.code === "FILE_NOT_FOUND") {
    return res.status(404).json({
      errorCode: error.code,
      message: error.message,
      metadataPath: error.metadataPath,
    });
  }

  return res.status(500).json({
    error: error.message,
  });
}
};