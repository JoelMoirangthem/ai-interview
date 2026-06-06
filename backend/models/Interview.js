const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  question: String,
  requiresCode: { type: Boolean, default: false },
  answer: String,
  code: String,
  language: String,
  codeOutput: String,
  stderr: String,
  codeEval: {
    score: Number,
    correctness: String,
    timeComplexity: String,
    spaceComplexity: String,
    codeQuality: Number,
    strengths: [String],
    weaknesses: [String],
    feedback: String
  },
  evaluation: {
    technicalAccuracy: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    completeness: { type: Number, default: 0 },
    depthOfUnderstanding: { type: Number, default: 0 }
  },
  timestamp: { type: Date, default: Date.now }
});

const interviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mode: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  conversations: [conversationSchema],
  feedback: {
    overallScore: { type: Number, default: 0 },
    technicalScore: { type: Number, default: 0 },
    communicationScore: { type: Number, default: 0 },
    confidenceScore: { type: Number, default: 0 },
    problemSolvingScore: { type: Number, default: 0 },
    interviewReadinessScore: { type: Number, default: 0 },
    strengths: [{
      name: String,
      evidence: String
    }],
    weaknesses: [{
      name: String,
      evidence: String
    }],
    recommendation: {
      type: String,
      enum: ['strong-hire', 'hire', 'borderline', 'needs-improvement'],
      default: 'needs-improvement'
    },
    improvementRoadmap: {
      immediate: [String],
      shortTerm: [String],
      longTerm: [String]
    }
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
