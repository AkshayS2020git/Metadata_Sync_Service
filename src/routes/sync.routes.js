const express = require('express');
const syncController = require('../controllers/sync.controller');

const router = express.Router();

router.get('/health', syncController.getHealth);
router.post('/sync', syncController.syncMetadata);

module.exports = router;
