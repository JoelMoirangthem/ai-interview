const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../utils/helpers');

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  targetRole: user.targetRole || '',
  experienceLevel: user.experienceLevel || 'entry',
  hasResume: user.hasResume || false
});

const googleAuth = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { uid, email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    let user = await User.findOne({ $or: [{ googleId: uid }, { email: email.toLowerCase() }] });

    if (user) {
      user.googleId = uid;
      user.name = name || user.name;
      user.avatar = photoURL || user.avatar;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        googleId: uid,
        avatar: photoURL || ''
      });
    }

    const token = generateToken(user._id);
    res.json({ token, user: formatUser(user) });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

const getMe = async (req, res) => {
  try {
    res.json(formatUser(req.user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, targetRole, experienceLevel } = req.body;
    const user = await User.findById(req.user._id);

    if (name !== undefined) user.name = name.trim();
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;

    await user.save();
    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  googleAuth, getMe, updateProfile
};
