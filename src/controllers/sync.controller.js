const syncService = require('../services/sync.service');

exports.getHealth = (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'Metadata Sync Service',
  });
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
