const express = require('express');
const { uploadResume, getResume, reparseResume, updateResumeProfile } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);
router.post('/reparse', protect, reparseResume);
router.put('/profile', protect, updateResumeProfile);

module.exports = router;
