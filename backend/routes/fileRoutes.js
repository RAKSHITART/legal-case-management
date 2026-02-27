const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { downloadCasePDF } = require('../controllers/fileController');

// Protect all routes
router.use(protect);

// Download case as PDF
router.get('/cases/:id/download', downloadCasePDF);

module.exports = router;