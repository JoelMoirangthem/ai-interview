const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rawText: {
    type: String,
    default: ''
  },
  imageKitFileId: {
    type: String,
    default: ''
  },
  imageKitUrl: {
    type: String,
    default: ''
  },
  profile: {
    skills: [String],
    projects: [String],
    technologies: [String],
    education: [String],
    strengths: [String],
    weakAreas: [String],
    experienceLevel: {
      type: String,
      default: 'entry'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
