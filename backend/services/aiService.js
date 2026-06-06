const axios = require('axios');

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

let aiAvailable = true;

const checkAIAvailability = async () => {
  if (!process.env.GROQ_API_KEY) {
    aiAvailable = false;
    return false;
  }
  try {
    const response = await axios.post(API_URL, {
      model: process.env.LLM_MODEL || 'llama3-70b-8192',
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    aiAvailable = response.status === 200;
    return aiAvailable;
  } catch {
    aiAvailable = false;
    return false;
  }
};

const isAIAvailable = () => aiAvailable;

const callLLM = async (messages, temperature = 0.7, maxTokens = 2000) => {
  try {
    const response = await axios.post(API_URL, {
      model: process.env.LLM_MODEL || 'llama3-70b-8192',
      messages,
      temperature,
      max_tokens: maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    aiAvailable = true;
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    aiAvailable = false;
    throw new Error('AI service is unavailable. Please try again later.');
  }
};

const CODE_QUESTION_RE = /\b(write|implement|code|solve|create|develop|program|pseudocode|coding|refactor|optimize|convert|parse|build|construct|generate|traverse|sort|search)\b/i;

const requiresCode = (question) => {
  if (!question) return false;
  return CODE_QUESTION_RE.test(question);
};

const parseResume = async (resumeText) => {
  const messages = [
    {
      role: 'system',
      content: `You are an expert resume analyzer. Extract structured information from the resume text.
Return ONLY valid JSON with this exact structure:
{
  "skills": ["skill1", "skill2"],
  "projects": ["project1", "project2"],
  "technologies": ["tech1", "tech2"],
  "education": ["education1"],
  "strengths": ["strength1"],
  "weakAreas": ["weakness1"],
  "experienceLevel": "entry|junior|mid|senior|lead"
}
No explanation, no markdown, only the JSON.`
    },
    {
      role: 'user',
      content: `Analyze this resume and return the structured JSON profile:\n\n${resumeText}`
    }
  ];

  const result = await callLLM(messages, 0.3, 1500);
  const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const generateInterviewQuestion = async ({ profile, conversationHistory, mode, difficulty, user }) => {
  const isDSA = mode === 'Data Structures & Algorithms';
  const historyContext = conversationHistory.map(c => {
    let entry = `Q: ${c.question}\nA: ${c.answer || '[pending]'}`;
    if (c.evaluation) {
      const e = c.evaluation;
      entry += `\nQuality: technical=${e.technicalAccuracy}/10, communication=${e.communication}/10, problemSolving=${e.problemSolving}/10`;
    }
    if (c.codeEval) {
      entry += `\nCode: score=${c.codeEval.score}/100, correctness=${c.codeEval.correctness || 'unknown'}, "${c.codeEval.feedback || ''}"`;
    }
    if (c.stderr) {
      entry += `\nErrors: ${c.stderr}`;
    }
    return entry;
  }).join('\n\n');

  const profileContext = profile ? `
Resume:
- Skills: ${profile.skills?.join(', ') || 'none listed'}
- Tech: ${profile.technologies?.join(', ') || 'none listed'}
- Projects: ${profile.projects?.join(', ') || 'none listed'}
- Strengths: ${profile.strengths?.join(', ') || 'none listed'}
- Growth areas: ${profile.weakAreas?.join(', ') || 'none listed'}
- Level: ${profile.experienceLevel || 'unknown'}
` : 'No resume available.';

  const systemPrompt = `You are a human interviewer conducting a live ${mode} interview. Difficulty target: ${difficulty}.

Be natural — like a real interviewer sitting across the table. React to answers, acknowledge them, dig deeper when something is interesting, pivot when they struggle. Ask follow-ups. Make it flow like a real conversation, not a questionnaire.

Personalize every question to THIS candidate. If their resume mentions React projects, ask about React. If they list Python, ask Python questions. Avoid generic questions — use their resume and their previous answers to craft each question.

If the candidate gives a strong answer, acknowledge it briefly and move to a deeper or adjacent topic. If they struggle, offer encouragement and shift to something they're more likely to know. Never make them feel bad.

For DSA roles, ask coding questions and have them implement solutions. For other roles, ask scenario-based, conceptual, or experience-based questions.

Important:
- Sound like a human, not a bot. Use natural language.
- React to what the candidate just said before asking the next thing.
- Use their resume to make every question feel tailored.
- Keep questions focused (1-3 sentences) but don't be rigid about it.
- Adapt difficulty naturally — if they breeze through, go deeper; if they struggle, ease up.
- Avoid asking about their weak areas (${profile?.weakAreas?.join(', ') || 'listed above'}) unless they show readiness.`;

  const userPrompt = `${profileContext}

${historyContext ? `Conversation so far:\n${historyContext}\n` : 'This is the very first question.'}

${historyContext.length === 0
  ? `The interview is just starting. Greet the candidate warmly, then ask your first question. Based on their resume, ask something relevant to their skills and the ${mode} role they're applying for. Make it personal — reference something from their resume.`
  : `The candidate just answered. React naturally to what they said, then ask the next question. Build on their last answer — dig deeper, connect it to something from their resume, or pivot to a new topic if appropriate. Make it feel like a flowing conversation.`
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];

  const result = await callLLM(messages, 0.8, 500);
  return { question: result, requiresCode: isDSA && requiresCode(result) };
};

const evaluateAnswer = async ({ question, answer, mode, difficulty }) => {
  const messages = [
    {
      role: 'system',
      content: `You are an expert interview evaluator. Evaluate the candidate's answer discreetly.
Return ONLY valid JSON with this exact structure:
{
  "technicalAccuracy": 0-10,
  "communication": 0-10,
  "confidence": 0-10,
  "problemSolving": 0-10,
  "completeness": 0-10,
  "depthOfUnderstanding": 0-10,
  "notes": "brief internal notes"
}
No explanation, no markdown, only the JSON.`
    },
    {
      role: 'user',
      content: `Role: ${mode}
Difficulty: ${difficulty}
Question: ${question}
Answer: ${answer}

Evaluate this answer and return the JSON score.`
    }
  ];

  const result = await callLLM(messages, 0.3, 800);
  const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const generateFeedback = async ({ conversations, mode, profile }) => {
  const conversationLog = conversations.map(c =>
    `Q: ${c.question}\nA: ${c.answer}\nScore: ${JSON.stringify(c.evaluation)}`
  ).join('\n\n');

  const messages = [
    {
      role: 'system',
      content: `You are an expert interview feedback generator. Create comprehensive feedback.
Return ONLY valid JSON with this exact structure:
{
  "overallScore": 0-100,
  "technicalScore": 0-100,
  "communicationScore": 0-100,
  "confidenceScore": 0-100,
  "problemSolvingScore": 0-100,
  "interviewReadinessScore": 0-100,
  "strengths": [{"name": "Skill Name", "evidence": "specific example from interview"}],
  "weaknesses": [{"name": "Area Name", "evidence": "specific example from interview"}],
  "recommendation": "strong-hire|hire|borderline|needs-improvement",
  "improvementRoadmap": {
    "immediate": ["action1", "action2"],
    "shortTerm": ["action1", "action2"],
    "longTerm": ["action1", "action2"]
  }
}`
    },
    {
      role: 'user',
      content: `Interview Role: ${mode}
Profile: ${JSON.stringify(profile)}

Interview Log:
${conversationLog}

Generate comprehensive feedback. Consider all answers, scores, and the candidate's profile.`
    }
  ];

  const result = await callLLM(messages, 0.4, 2000);
  const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

const evaluateCode = async ({ code, language, question, stdout, stderr }) => {
  const messages = [
    {
      role: 'system',
      content: `You are an expert code evaluator for technical interviews.
Return ONLY valid JSON with this exact structure:
{
  "score": 0-100,
  "correctness": "correct|partial|incorrect",
  "timeComplexity": "O(...) or N/A",
  "spaceComplexity": "O(...) or N/A",
  "codeQuality": 0-10,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "feedback": "brief actionable feedback"
}
No explanation, no markdown, only the JSON.`
    },
    {
      role: 'user',
      content: `Question: ${question || 'N/A'}
Language: ${language}
Code:
${code}

Execution Output (stdout):
${stdout || '(no output)'}

Execution Errors (stderr):
${stderr || '(no errors)'}

Evaluate this code solution. Consider correctness, efficiency, code quality, and output.`
    }
  ];

  const result = await callLLM(messages, 0.3, 1000);
  const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { parseResume, generateInterviewQuestion, evaluateAnswer, generateFeedback, evaluateCode, checkAIAvailability, isAIAvailable };
