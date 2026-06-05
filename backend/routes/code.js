const express = require('express');
const router = express.Router();
const { execute, submit } = require('../controllers/codeController');
const { protect } = require('../middleware/auth');

router.post('/execute', protect, execute);
router.post('/submit', protect, submit);

module.exports = router;