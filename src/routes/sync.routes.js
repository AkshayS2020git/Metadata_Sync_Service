const express = require('express');
const syncController = require('../controllers/sync.controller');

const router = express.Router();

router.get('/health', syncController.getHealth);
// TODO: Temporary development endpoint for testing MinIO infrastructure. Remove or protect before production deployment.
router.get('/buckets', syncController.getBuckets);
router.get("/version", syncController.getLatestVersion);
router.post('/sync', syncController.syncMetadata);
router.get("/metadata", syncController.getMetadata);

module.exports = router;
