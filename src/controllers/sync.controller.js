const syncService = require('../services/sync.service');
const minioClient = require('../clients/minio.client');
const { resolveVersion } = require("../resolvers/version.resolver");
const { discoverMetadata } = require("../services/discovery.service");
const { readMetadata } = require("../services/metadata.service");



exports.getHealth = async (req, res) => {
  try {
    await minioClient.healthCheck();

    return res.status(200).json({
      status: 'healthy',
      service: 'Metadata Sync Service',
      minio: {
        available: true,
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      service: 'Metadata Sync Service',
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
    const bucketNames = buckets.map((bucket) => bucket.name);

    return res.status(200).json({
      count: bucketNames.length,
      buckets: bucketNames,
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
      objectKey: result.objectKey,
    });
  } catch (error) {
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

exports.getMetadata = async (req, res) => {
  try {
    const payload = {
      project: "Legacy Ruckus",
      testRun: "R750",
      feature: "Client Isolation",
      run: "Run1",
    };

    const { bucket, objectKey } = await discoverMetadata(payload);
    const metadata = await readMetadata(bucket, objectKey);

    return res.json(metadata);    
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};