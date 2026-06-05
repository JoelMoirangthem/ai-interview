const express = require('express');
const { body } = require('express-validator');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getInterviewHistory,
  getInterviewModes
} = require('../controllers/interviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/modes', getInterviewModes);

router.post('/start', protect, [
  body('mode').trim().notEmpty().withMessage('Interview mode is required')
], startInterview);

router.post('/respond', protect, [
  body('interviewId').notEmpty().withMessage('Interview ID is required'),
  body('answer').trim().isLength({ min: 1, max: 10000 }).withMessage('Answer must be 1-10000 characters')
], submitAnswer);

router.post('/:id/complete', protect, completeInterview);

router.get('/history', protect, getInterviewHistory);

router.get('/:id', protect, getInterview);

module.exports = router;