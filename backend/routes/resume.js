const express = require('express');
const { body } = require('express-validator');
const { uploadResume, getResume, reparseResume, updateResumeProfile } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const { resumeLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

const router = express.Router();

router.post('/upload', protect, resumeLimiter, upload.single('resume'), uploadResume);

router.get('/', protect, getResume);

router.post('/reparse', protect, reparseResume);

router.put('/profile', protect, [
  body('skills').optional().isArray({ max: 50 }).withMessage('Max 50 skills'),
  body('technologies').optional().isArray({ max: 50 }),
  body('projects').optional().isArray({ max: 30 }),
  body('education').optional().isArray({ max: 20 }),
  body('strengths').optional().isArray({ max: 20 }),
  body('weakAreas').optional().isArray({ max: 20 }),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead'])
], updateResumeProfile);

module.exports = router;