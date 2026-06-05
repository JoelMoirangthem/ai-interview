const Resume = require('../models/Resume');
const User = require('../models/User');
const { extractTextFromPDF } = require('../services/pdfService');
const { parseResume } = require('../services/aiService');
const { uploadPDF, deleteFile, downloadFile } = require('../services/imageKitService');

const uploadResume = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'Please upload a PDF file' });
    }

    const rawText = await extractTextFromPDF(req.file.buffer);
    const aiProfile = await parseResume(rawText);

    const result = await uploadPDF(req.file.buffer, `resume-${req.user._id}.pdf`);

    const existing = await Resume.findOne({ userId: req.user._id });
    if (existing && existing.imageKitFileId) {
      deleteFile(existing.imageKitFileId).catch(() => {});
    }

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        rawText,
        imageKitFileId: result.fileId,
        imageKitUrl: result.url,
        profile: aiProfile
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await User.findByIdAndUpdate(req.user._id, { hasResume: true });

    res.json({
      message: 'Resume analyzed successfully',
      profile: resume.profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process resume', error: error.message });
  }
};

const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload one.' });
    }
    res.json({ profile: resume.profile, hasResume: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const reparseResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found. Please upload one.' });
    }
    if (!resume.imageKitUrl) {
      return res.status(400).json({ message: 'No stored PDF to re-parse' });
    }

    let rawText = resume.rawText;
    if (!rawText) {
      const pdfBuffer = await downloadFile(resume.imageKitUrl);
      rawText = await extractTextFromPDF(pdfBuffer);
    }

    const aiProfile = await parseResume(rawText);

    resume.rawText = rawText;
    resume.profile = aiProfile;
    await resume.save();

    res.json({ message: 'Resume re-parsed successfully', profile: resume.profile });
  } catch (error) {
    res.status(500).json({ message: 'Failed to re-parse resume', error: error.message });
  }
};

const updateResumeProfile = async (req, res) => {
  try {
    const { skills, technologies, projects, education, strengths, weakAreas, experienceLevel } = req.body;

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ message: 'No resume found' });
    }

    if (skills !== undefined) resume.profile.skills = skills.slice(0, 50);
    if (technologies !== undefined) resume.profile.technologies = technologies.slice(0, 50);
    if (projects !== undefined) resume.profile.projects = projects.slice(0, 30);
    if (education !== undefined) resume.profile.education = education.slice(0, 20);
    if (strengths !== undefined) resume.profile.strengths = strengths.slice(0, 20);
    if (weakAreas !== undefined) resume.profile.weakAreas = weakAreas.slice(0, 20);
    if (experienceLevel !== undefined) {
      const valid = ['entry', 'junior', 'mid', 'senior', 'lead'];
      if (valid.includes(experienceLevel)) {
        resume.profile.experienceLevel = experienceLevel;
      }
    }

    await resume.save();

    res.json({ message: 'Profile updated', profile: resume.profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadResume, getResume, reparseResume, updateResumeProfile };
