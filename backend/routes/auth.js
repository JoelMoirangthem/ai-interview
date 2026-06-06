const express = require('express');
const { body } = require('express-validator');
const {
  googleAuth, getMe, updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax'
  });
  res.json({ message: 'Logged out successfully' });
});

router.post('/google', [
  body('uid').notEmpty().withMessage('Google UID required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('name').optional().trim().isLength({ max: 100 }),
  body('photoURL').optional().trim().isLength({ max: 500 })
], googleAuth);

router.get('/me', protect, getMe);

router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('targetRole').optional().trim().isLength({ max: 100 }),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'lead'])
], updateProfile);

module.exports = router;
