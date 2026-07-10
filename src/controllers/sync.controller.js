const syncService = require('../services/sync.service');
const minioClient = require('../clients/minio.client');

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

exports.syncMetadata = (req, res) => {
  const result = syncService.acceptSyncRequest(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  return res.status(200).json({
    status: 'received',
    message: 'Synchronization request accepted.',
  });
};
