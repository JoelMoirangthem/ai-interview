const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

const calculateAverageScore = (evaluations) => {
  if (!evaluations || evaluations.length === 0) return 0;
  const sum = evaluations.reduce((acc, e) => {
    return acc + (e.technicalAccuracy || 0) + (e.communication || 0) +
      (e.confidence || 0) + (e.problemSolving || 0) +
      (e.completeness || 0) + (e.depthOfUnderstanding || 0);
  }, 0);
  return Math.round((sum / (evaluations.length * 6)) * 10);
};

const INTERVIEW_MODES = [
  'Frontend Developer',
  'Backend Developer',
  'MERN Stack Developer',
  'Full Stack Developer',
  'Java Developer',
  'Python Developer',
  'Data Structures & Algorithms',
  'HR Interview',
  'System Design',
  'Custom Interview'
];

module.exports = { generateToken, calculateAverageScore, INTERVIEW_MODES };
