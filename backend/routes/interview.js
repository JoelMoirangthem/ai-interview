const express = require('express');
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
router.post('/start', protect, startInterview);
router.post('/respond', protect, submitAnswer);
router.post('/:id/complete', protect, completeInterview);
router.get('/history', protect, getInterviewHistory);
router.get('/:id', protect, getInterview);

module.exports = router;
