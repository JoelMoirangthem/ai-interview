const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, targetRole, experienceLevel } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      targetRole: targetRole || '',
      experienceLevel: experienceLevel || 'entry'
    });

    const token = generateToken(user._id);

    res.status(201).json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({ token, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { uid, email, name, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required from Google' });
    }

    let user = await User.findOne({ $or: [{ googleId: uid }, { email }] });

    if (user) {
      user.googleId = uid;
      user.name = name || user.name;
      user.avatar = photoURL || user.avatar;
      if (!user.password) user.password = undefined;
      await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
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
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, targetRole, experienceLevel } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel) user.experienceLevel = experienceLevel;

    await user.save();

    res.json(formatUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, googleAuth, getMe, updateProfile };
