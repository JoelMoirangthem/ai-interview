const express = require('express');
const { getDashboard, getProgress } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', protect, getDashboard);
router.get('/progress', protect, getProgress);

module.exports = router;