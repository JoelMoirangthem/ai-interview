const axios = require('axios');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const { evaluateCode, generateInterviewQuestion } = require('../services/aiService');

const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

const COMPILERS = {
  javascript: 'nodejs-20.17.0',
  js: 'nodejs-20.17.0',
  python: 'cpython-3.12.7',
  py: 'cpython-3.12.7',
  java: 'openjdk-jdk-22+36',
  cpp: 'clang-16.0.4',
  c: 'gcc-head',
  go: 'go-1.23.2',
  rust: 'rust-1.82.0',
  ts: 'typescript-5.6.2',
  typescript: 'typescript-5.6.2'
};

const runCode = async (code, language) => {
  const compiler = COMPILERS[language.toLowerCase()];
  if (!compiler) throw new Error(`Unsupported language: ${language}`);

  const response = await axios.post(WANDBOX_URL, {
    compiler,
    code,
    options: 'warning',
    stdin: ''
  }, { timeout: 30000 });

  return {
    stdout: response.data.program_output || response.data.output || '',
    stderr: response.data.program_error || response.data.compiler_error || '',
    error: response.data.program_message || response.data.compiler_message || ''
  };
};

const execute = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    if (typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ message: 'Code cannot be empty' });
    }
    if (code.length > 50000) {
      return res.status(400).json({ message: 'Code must be under 50000 characters' });
    }
    if (typeof language !== 'string' || language.length > 20) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    const result = await runCode(code, language);

    res.json({
      stdout: result.stdout,
      stderr: result.stderr,
      output: result.error || result.stdout || result.stderr || '(no output)'
    });
  } catch (error) {
    console.error('Code execution error:', error.response?.data || error.message);

    if (error.response?.status === 429) {
      return res.status(429).json({ message: 'Execution service temporarily unavailable. Try again.' });
    }

    res.status(500).json({ message: 'Code execution failed', error: error.message });
  }
};

const submit = async (req, res) => {
  try {
    const { interviewId, code, language, question } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }
    if (typeof code !== 'string' || code.trim().length === 0) {
      return res.status(400).json({ message: 'Code cannot be empty' });
    }
    if (code.length > 50000) {
      return res.status(400).json({ message: 'Code must be under 50000 characters' });
    }
    if (typeof language !== 'string' || language.length > 20) {
      return res.status(400).json({ message: 'Invalid language' });
    }

    let stdout = '', stderr = '', execError = null;
    try {
      const result = await runCode(code, language);
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err) {
      execError = err.message;
      stderr = execError;
    }

    const evaluation = await evaluateCode({ code, language, question, stdout, stderr });

    let nextQuestion = null;
    let requiresCode = false;

    if (interviewId) {
      const interview = await Interview.findById(interviewId);
      if (interview) {
        const lastConv = interview.conversations[interview.conversations.length - 1];
        if (lastConv) {
          lastConv.code = code;
          lastConv.language = language;
          lastConv.codeOutput = stdout;
          lastConv.stderr = stderr;
          lastConv.codeEval = evaluation;
          if (!lastConv.answer) {
            lastConv.answer = '[Code Submission]';
          }
          lastConv.timestamp = new Date();

          const avgScore = (evaluation?.score || 50) / 10;
          if (avgScore >= 7 && interview.difficulty === 'easy') {
            interview.difficulty = 'medium';
          } else if (avgScore >= 8 && interview.difficulty === 'medium') {
            interview.difficulty = 'hard';
          } else if (avgScore < 4 && interview.difficulty === 'hard') {
            interview.difficulty = 'medium';
          } else if (avgScore < 3 && interview.difficulty === 'medium') {
            interview.difficulty = 'easy';
          }

          const resume = await Resume.findOne({ userId: interview.userId });
          const qResult = await generateInterviewQuestion({
            profile: resume?.profile || null,
            conversationHistory: interview.conversations,
            mode: interview.mode,
            difficulty: interview.difficulty,
            user: { _id: interview.userId }
          });

          nextQuestion = qResult.question || qResult;
          requiresCode = qResult.requiresCode === true;

          interview.conversations.push({ question: nextQuestion, requiresCode, answer: '', timestamp: new Date() });
        }
        await interview.save();
      }
    }

    res.json({ stdout, stderr, evaluation, nextQuestion, requiresCode, execError });
  } catch (error) {
    console.error('Code submit error:', error.message);
    res.status(500).json({ message: 'Failed to process code submission' });
  }
};

module.exports = { execute, submit };
