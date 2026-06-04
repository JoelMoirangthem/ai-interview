const Interview = require('../models/Interview');
const Resume = require('../models/Resume');

const getDashboard = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: 'completed'
    }).sort({ completedAt: -1 });

    const lastInterview = interviews[0] || null;

    const totalInterviews = interviews.length;
    const recentInterviews = interviews.slice(0, 5).map(i => ({
      id: i._id,
      mode: i.mode,
      score: i.feedback?.overallScore || 0,
      date: i.completedAt
    }));

    const recentScores = interviews.slice(0, 10).reverse().map(i => ({
      date: i.completedAt,
      overall: i.feedback?.overallScore || 0,
      technical: i.feedback?.technicalScore || 0,
      communication: i.feedback?.communicationScore || 0,
      confidence: i.feedback?.confidenceScore || 0
    }));

    let avgOverall = 0, avgTechnical = 0, avgCommunication = 0, avgConfidence = 0,
        avgProblemSolving = 0, avgReadiness = 0;

    if (totalInterviews > 0) {
      avgOverall = Math.round(interviews.reduce((s, i) => s + (i.feedback?.overallScore || 0), 0) / totalInterviews);
      avgTechnical = Math.round(interviews.reduce((s, i) => s + (i.feedback?.technicalScore || 0), 0) / totalInterviews);
      avgCommunication = Math.round(interviews.reduce((s, i) => s + (i.feedback?.communicationScore || 0), 0) / totalInterviews);
      avgConfidence = Math.round(interviews.reduce((s, i) => s + (i.feedback?.confidenceScore || 0), 0) / totalInterviews);
      avgProblemSolving = Math.round(interviews.reduce((s, i) => s + (i.feedback?.problemSolvingScore || 0), 0) / totalInterviews);
      avgReadiness = Math.round(interviews.reduce((s, i) => s + (i.feedback?.interviewReadinessScore || 0), 0) / totalInterviews);
    }

    const modeStats = interviews.reduce((acc, i) => {
      const mode = i.mode;
      if (!acc[mode]) acc[mode] = { count: 0, totalScore: 0 };
      acc[mode].count++;
      acc[mode].totalScore += i.feedback?.overallScore || 0;
      return acc;
    }, {});

    const modePerformance = Object.entries(modeStats).map(([mode, data]) => ({
      mode,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count)
    }));

    const resume = await Resume.findOne({ userId: req.user._id });

    res.json({
      totalInterviews,
      averageScores: {
        overall: avgOverall,
        technical: avgTechnical,
        communication: avgCommunication,
        confidence: avgConfidence,
        problemSolving: avgProblemSolving,
        readiness: avgReadiness
      },
      recentInterviews,
      recentScores,
      modePerformance,
      lastInterview,
      profile: resume?.profile || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProgress = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user._id,
      status: 'completed'
    }).sort({ completedAt: 1 });

    const progressData = interviews.map(i => ({
      date: i.completedAt,
      overall: i.feedback?.overallScore || 0,
      technical: i.feedback?.technicalScore || 0,
      communication: i.feedback?.communicationScore || 0,
      confidence: i.feedback?.confidenceScore || 0,
      problemSolving: i.feedback?.problemSolvingScore || 0,
      readiness: i.feedback?.interviewReadinessScore || 0
    }));

    const allStrengths = {};
    const allWeaknesses = {};

    interviews.forEach(i => {
      (i.feedback?.strengths || []).forEach(s => {
        allStrengths[s.name] = (allStrengths[s.name] || 0) + 1;
      });
      (i.feedback?.weaknesses || []).forEach(w => {
        allWeaknesses[w.name] = (allWeaknesses[w.name] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(allStrengths)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topWeaknesses = Object.entries(allWeaknesses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({ progressData, topStrengths, topWeaknesses });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboard, getProgress };
