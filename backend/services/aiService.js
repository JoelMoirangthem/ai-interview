const axios = require('axios');

const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const callLLM = async (messages, temperature = 0.7, maxTokens = 2000) => {
  try {
    const response = await axios.post(API_URL, {
      model: process.env.LLM_MODEL || 'openai/gpt-oss-20b',
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

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('AI Service Error:', error.response?.data || error.message);
    throw new Error('AI service failed');
  }
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
No explanation, no markdown, only the JSON object.`
    },
    {
      role: 'user',
      content: `Analyze this resume and return the structured JSON profile:\n\n${resumeText}`
    }
  ];

  const result = await callLLM(messages, 0.3, 1500);
  try {
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse AI resume response:', result);
    return {
      skills: [],
      projects: [],
      technologies: [],
      education: [],
      strengths: [],
      weakAreas: [],
      experienceLevel: 'entry'
    };
  }
};

const CODE_QUESTION_RE = /\b(write|implement|code|solve|create|develop|program|pseudocode|coding|refactor|optimize|convert|parse|build|construct|generate|traverse|sort|search)\b/i;

const requiresCode = (question) => {
  if (!question) return false;
  return CODE_QUESTION_RE.test(question);
};

const generateInterviewQuestion = async ({ profile, conversationHistory, mode, difficulty, user }) => {
  const isDSA = mode === 'Data Structures & Algorithms';
  const historyContext = conversationHistory.map(c =>
    `Q: ${c.question}\nA: ${c.answer || '[pending]'}`
  ).join('\n\n');

  const profileContext = profile ? `
Candidate Profile:
Skills: ${profile.skills?.join(', ')}
Technologies: ${profile.technologies?.join(', ')}
Projects: ${profile.projects?.join(', ')}
Strengths: ${profile.strengths?.join(', ')}
Weak Areas: ${profile.weakAreas?.join(', ')}
Experience Level: ${profile.experienceLevel}
` : 'No resume profile available.';

  const systemPrompt = `You are a professional technical interviewer conducting a LIVE interview.
Role: ${mode} Interviewer
Difficulty: ${difficulty}

RULES - CRITICAL:
1. Ask ONE question at a time. NEVER ask multiple questions.
2. Sound like a real human interviewer, not a chatbot.
3. Be conversational but professional.
4. Build on the candidate's previous answers.
5. If they mention a project, dig deeper with follow-ups.
6. Challenge weak answers gently but firmly.
7. Increase difficulty gradually based on performance.
8. NEVER reveal you are scoring or evaluating.
9. NEVER break character as an interviewer.
10. Keep questions concise (1-3 sentences).

11. Adapt to the candidate's experience level.
12. Start with general questions, then get specific.
13. For DSA roles, focus  on problem-solving and coding questions to implement code.
`;

  const userPrompt = `${profileContext}

Interview Context:
Mode: ${mode}
Current Difficulty: ${difficulty}

Conversation History:
${historyContext || 'This is the first question.'}

${historyContext.length === 0
  ? 'Generate the FIRST interview question. Start with a brief greeting and an opening question relevant to the role.'
  : 'Generate the NEXT interview question based on the candidate\'s last answer. Dig deeper, challenge, or pivot as appropriate.'
}

Remember: ONE question only. Be conversational. Be human.`;

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
  try {
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      technicalAccuracy: 5,
      communication: 5,
      confidence: 5,
      problemSolving: 5,
      completeness: 5,
      depthOfUnderstanding: 5,
      notes: 'Evaluation parsing failed'
    };
  }
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
  try {
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      overallScore: 50,
      technicalScore: 50,
      communicationScore: 50,
      confidenceScore: 50,
      problemSolvingScore: 50,
      interviewReadinessScore: 50,
      strengths: [{ name: 'Participation', evidence: 'Completed the interview' }],
      weaknesses: [{ name: 'General', evidence: 'Need more practice' }],
      recommendation: 'needs-improvement',
      improvementRoadmap: {
        immediate: ['Review fundamentals'],
        shortTerm: ['Practice more interviews'],
        longTerm: ['Build more projects']
      }
    };
  }
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
  try {
    const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    return {
      score: 50,
      correctness: 'partial',
      timeComplexity: 'N/A',
      spaceComplexity: 'N/A',
      codeQuality: 5,
      strengths: ['Attempted the problem'],
      weaknesses: ['Unable to fully evaluate'],
      feedback: 'Evaluation parsing failed'
    };
  }
};

module.exports = { parseResume, generateInterviewQuestion, evaluateAnswer, generateFeedback, evaluateCode };
