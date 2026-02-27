const express = require('express');
const router = express.Router();
const { getDashboardStats, getCalendarEvents } = require('../controllers/DashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/calendar', getCalendarEvents);

module.exports = router;