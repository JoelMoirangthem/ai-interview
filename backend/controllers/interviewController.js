const { Types } = require('mongoose');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const User = require('../models/User');
const { generateInterviewQuestion, evaluateAnswer, generateFeedback } = require('../services/aiService');
const { INTERVIEW_MODES } = require('../utils/helpers');
const interviewState = require('../services/interviewState');

const startInterview = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!mode || typeof mode !== 'string' || !INTERVIEW_MODES.includes(mode)) {
      return res.status(400).json({ message: 'Invalid interview mode' });
    }

    const interview = await Interview.create({
      userId: req.user._id,
      mode,
      difficulty: 'easy',
      status: 'in-progress',
      conversations: []
    });

    const resume = await Resume.findOne({ userId: req.user._id }).select('profile');
    const profile = resume?.profile || null;

    const result = await generateInterviewQuestion({
      profile,
      conversationHistory: [],
      mode,
      difficulty: 'easy',
      user: req.user
    });

    const question = result.question || result;
    const requiresCode = result.requiresCode === true;

    interview.conversations.push({ question, requiresCode, answer: '', timestamp: new Date() });
    await interview.save();

    interviewState.set(interview._id, {
      userId: String(req.user._id),
      mode,
      difficulty: 'easy',
      profile
    });

    res.json({
      interviewId: interview._id,
      question,
      requiresCode,
      conversationIndex: 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start interview', error: error.message });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;

    if (!interviewId) {
      return res.status(400).json({ message: 'Interview ID is required' });
    }
    if (!Types.ObjectId.isValid(interviewId)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }
    if (!answer || typeof answer !== 'string' || answer.trim().length === 0) {
      return res.status(400).json({ message: 'Answer is required' });
    }

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const lastConversation = interview.conversations[interview.conversations.length - 1];
    if (!lastConversation) {
      return res.status(400).json({ message: 'No active question' });
    }

    lastConversation.answer = answer;
    lastConversation.timestamp = new Date();

    const evaluation = await evaluateAnswer({
      question: lastConversation.question,
      answer,
      mode: interview.mode,
      difficulty: interview.difficulty
    });

    lastConversation.evaluation = {
      technicalAccuracy: evaluation.technicalAccuracy || 0,
      communication: evaluation.communication || 0,
      confidence: evaluation.confidence || 0,
      problemSolving: evaluation.problemSolving || 0,
      completeness: evaluation.completeness || 0,
      depthOfUnderstanding: evaluation.depthOfUnderstanding || 0
    };

    const scores = [
      evaluation.technicalAccuracy || 0,
      evaluation.communication || 0,
      evaluation.confidence || 0,
      evaluation.problemSolving || 0,
      evaluation.completeness || 0,
      evaluation.depthOfUnderstanding || 0
    ];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    if (avgScore >= 7 && interview.difficulty === 'easy') {
      interview.difficulty = 'medium';
    } else if (avgScore >= 8 && interview.difficulty === 'medium') {
      interview.difficulty = 'hard';
    } else if (avgScore < 4 && interview.difficulty === 'hard') {
      interview.difficulty = 'medium';
    } else if (avgScore < 3 && interview.difficulty === 'medium') {
      interview.difficulty = 'easy';
    }

    let stateCtx = interviewState.get(interview._id);
    if (!stateCtx) {
      const resume = await Resume.findOne({ userId: req.user._id }).select('profile');
      stateCtx = {
        userId: String(req.user._id),
        mode: interview.mode,
        difficulty: interview.difficulty,
        profile: resume?.profile || null
      };
      interviewState.set(interview._id, stateCtx);
    } else {
      stateCtx.difficulty = interview.difficulty;
      interviewState.touch(interview._id);
    }

    const result = await generateInterviewQuestion({
      profile: stateCtx.profile,
      conversationHistory: interview.conversations,
      mode: interview.mode,
      difficulty: interview.difficulty,
      user: req.user
    });

    const nextQuestion = result.question || result;
    const requiresCode = result.requiresCode === true;

    interview.conversations.push({ question: nextQuestion, requiresCode, answer: '', timestamp: new Date() });
    await interview.save();

    res.json({
      evaluation: lastConversation.evaluation,
      nextQuestion,
      requiresCode,
      difficulty: interview.difficulty,
      conversationIndex: interview.conversations.length - 1
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process answer', error: error.message });
  }
};

const completeInterview = async (req, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();

    const resume = await Resume.findOne({ userId: req.user._id }).select('profile');
    const profile = resume?.profile || {};

    const feedback = await generateFeedback({
      conversations: interview.conversations.filter(c => c.answer),
      mode: interview.mode,
      profile
    });

    interview.feedback = feedback;
    await interview.save();

    if (resume) {
      if (feedback.strengths) {
        feedback.strengths.forEach(s => {
          if (!resume.profile.strengths.includes(s.name)) {
            resume.profile.strengths.push(s.name);
          }
        });
      }
      if (feedback.weaknesses) {
        feedback.weaknesses.forEach(w => {
          if (!resume.profile.weakAreas.includes(w.name)) {
            resume.profile.weakAreas.push(w.name);
          }
        });
      }
      await resume.save();
    }

    interviewState.remove(interview._id);

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete interview', error: error.message });
  }
};

const getInterview = async (req, res) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid interview ID' });
    }
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }
    if (interview.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user._id })
      .select('mode difficulty status feedback.overallScore startedAt completedAt')
      .sort({ startedAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getInterviewModes = (req, res) => {
  res.json(INTERVIEW_MODES);
};

module.exports = {
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getInterviewHistory,
  getInterviewModes
};
