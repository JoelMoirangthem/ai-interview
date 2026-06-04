import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiAlertTriangle, FiClock, FiX, FiZap, FiCheckCircle, FiMessageSquare,
  FiArrowRight, FiCode, FiCpu
} from 'react-icons/fi';
import { interviewAPI, codeAPI } from '../services/api';
import { useVoice } from '../hooks/useVoice';
import MicButton from '../components/interview/MicButton';
import VoiceVisualizer from '../components/interview/VoiceVisualizer';
import Captions from '../components/interview/Captions';
import DifficultyIndicator from '../components/interview/DifficultyIndicator';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import CodeEditor from '../components/interview/CodeEditor';

const IS_DSA_MODE = (mode) => mode === 'Data Structures & Algorithms';

/* ============================================================
   ThinkingBubble — typing dots inside the AI's chat position
   ============================================================ */
function ThinkingBubble() {
  return (
    <motion.div
      key="ai-thinking"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-2xl mx-auto rounded-2xl border border-indigo-400/15 bg-indigo-500/[0.05] p-4"
    >
      <div className="flex items-center gap-2 mb-2 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
        <FiCpu className="w-3 h-3" />
        Interviewer
      </div>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-indigo-400 rounded-full typing-dot"
          />
        ))}
        <span className="text-xs text-white/40 ml-2">AI is thinking…</span>
      </div>
    </motion.div>
  );
}

export default function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { micOn, aiSpeaking, transcript, toggleMic, speak, cancelSpeech, isSupported } = useVoice();

  const [mode, setMode] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [conversations, setConversations] = useState([]);
  const [aiThinking, setAiThinking] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeLoading, setCodeLoading] = useState(null);
  const [codeOutput, setCodeOutput] = useState('');
  // Default to false — only show editor when an actual question requires code
  const [showEditor, setShowEditor] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const submitRef = useRef(null);
  const processingRef = useRef(false);
  const lastCaptionRef = useRef('');
  const isDSA = IS_DSA_MODE(mode);

  const speakQuestion = useCallback((text) => {
    setTimeout(() => speak(text), 300);
  }, [speak]);

  const submitAnswer = useCallback(async (answer) => {
    if (!answer || answer.trim().length < 2 || processingRef.current) return;
    processingRef.current = true;
    setAiThinking(true);

    try {
      const res = await interviewAPI.respond(id, answer);
      const updated = [...conversations];
      const last = { ...updated[updated.length - 1], answer };
      updated[updated.length - 1] = last;
      updated.push({ question: res.data.nextQuestion, answer: '' });
      setConversations(updated);
      setDifficulty(res.data.difficulty);
      // Only show the editor if this question actually requires code
      setShowEditor(res.data.requiresCode === true);
      setAiThinking(false);
      processingRef.current = false;
      speakQuestion(res.data.nextQuestion);
    } catch (_) {
      setAiThinking(false);
      processingRef.current = false;
    }
  }, [id, conversations, speakQuestion]);

  submitRef.current = submitAnswer;

  useEffect(() => {
    (async () => {
      try {
        const res = await interviewAPI.get(id);
        const interview = res.data;
        setMode(interview.mode);
        setDifficulty(interview.difficulty);
        if (interview.conversations?.length) {
          const existing = interview.conversations.filter(c => c.question);
          setConversations(existing);
          const last = existing[existing.length - 1];
          if (last && !last.answer) {
            lastCaptionRef.current = last.question;
            // Only show editor in DSA mode AND if this specific question requires code
            setShowEditor(IS_DSA_MODE(interview.mode) && last.requiresCode === true);
            speakQuestion(last.question);
          }
        }
      } catch (_) {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, speakQuestion]);

  useEffect(() => {
    if (loading) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleToggleMic = async () => {
    if (aiThinking || isCompleting) return;
    const wasOn = micOn;
    const answer = await toggleMic();
    if (wasOn) {
      if (answer && answer.trim().length >= 2) {
        submitRef.current(answer);
      }
    } else if (aiSpeaking) {
      cancelSpeech();
    }
  };

  const handleEnd = async () => {
    if (micOn) await toggleMic();
    cancelSpeech();
    setIsCompleting(true);
    try {
      await interviewAPI.complete(id);
      navigate(`/results/${id}`);
    } catch (_) {
      setIsCompleting(false);
    }
  };

  const handleCodeRun = async (code, language) => {
    setCodeLoading('run');
    setCodeOutput('');
    try {
      const res = await codeAPI.execute({ code, language });
      const out = res.data.stdout || res.data.stderr || '(no output)';
      setCodeOutput(out);
    } catch (_) {
      setCodeOutput('Execution failed. Check your code and try again.');
    } finally {
      setCodeLoading(null);
    }
  };

  const handleCodeSubmit = async (code, language) => {
    setCodeLoading('submit');
    setCodeOutput('');
    const lastQ = conversations[conversations.length - 1]?.question;
    try {
      const res = await codeAPI.submit({ interviewId: id, code, language, question: lastQ });
      const stdout = res.data.stdout || '';
      const stderr = res.data.stderr || '';
      const evaluation = res.data.evaluation;
      const nextQuestion = res.data.nextQuestion;

      if (nextQuestion) {
        const updated = [...conversations];
        const last = { ...updated[updated.length - 1], answer: '[Code Submission]', code, language, codeOutput: stdout };
        updated[updated.length - 1] = last;
        updated.push({ question: nextQuestion, answer: '' });
        setConversations(updated);
        // Only show editor for the next question if it requires code
        setShowEditor(res.data.requiresCode === true);
        speakQuestion(nextQuestion);
        const score = evaluation?.score || '—';
        const feedback = evaluation?.feedback || '';
        setCodeOutput(`${stdout}\n\nEvaluation: ${score}/100${feedback ? `\n${feedback}` : ''}`);
      } else {
        setCodeOutput(stdout || stderr || 'Submission processed');
      }
    } catch (_) {
      setCodeOutput('Submission failed. Try again.');
    } finally {
      setCodeLoading(null);
    }
  };

  const lastQuestion = conversations[conversations.length - 1]?.question || '';
  const answerCount = conversations.filter(c => c.answer).length;

  useEffect(() => {
    if (lastQuestion) lastCaptionRef.current = lastQuestion;
  }, [lastQuestion]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center mesh-bg">
        <div className="flex gap-2 mb-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
          ))}
        </div>
        <p className="text-sm text-white/40">Loading interview...</p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-3xl p-10 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-4">
            <FiAlertTriangle className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Browser not supported</h2>
          <p className="text-sm text-white/50 mb-6">
            Voice features need Web Speech API. Please open this page in Chrome or Edge.
          </p>
          <Button onClick={() => navigate('/dashboard')} iconRight={FiArrowRight}>
            Back to dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  // When AI is thinking, hide the visualizer — the "AI is thinking" message lives in the captions area now
  const visualState = aiThinking ? null : aiSpeaking ? 'speaking' : micOn ? 'recording' : 'idle';
  const stateLabel = {
    speaking:  'AI is speaking',
    recording: 'Listening to you',
    idle:      'Tap mic to speak'
  }[visualState || 'idle'];

  const conversationPanel = (
    <div className="flex flex-col h-full">
      {/* TOP BAR */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="purple" icon={FiMessageSquare} size="md">{mode}</Badge>
          <DifficultyIndicator difficulty={difficulty} />
          <span className="text-[10px] text-white/30 font-mono px-2 py-0.5 rounded bg-white/[0.04] flex items-center gap-1">
            <FiClock className="w-3 h-3" /> {formatTime(elapsed)}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnd}
          loading={isCompleting}
          icon={FiX}
        >
          End
        </Button>
      </div>

      {/* MAIN VISUAL */}
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-5">
        {/* Visualizer — hidden while AI is thinking so the typing bubble can take its place below */}
        <AnimatePresence mode="wait">
          {visualState ? (
            <motion.div
              key="visualizer"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <VoiceVisualizer status={visualState} />
            </motion.div>
          ) : (
            <motion.div
              key="thinking-visual"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-36 h-36 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 animate-pulse-glow" />
              <div className="absolute inset-3 rounded-full bg-[#0c0d12] border border-white/[0.08] flex items-center justify-center">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full typing-dot" />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATE PILL */}
        <motion.div
          key={visualState || 'thinking'}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border
            ${visualState === 'speaking'  ? 'bg-indigo-500/10 border-indigo-400/20 text-indigo-200' : ''}
            ${visualState === 'recording' ? 'bg-rose-500/10 border-rose-400/20 text-rose-200' : ''}
            ${visualState === 'idle'      ? 'bg-white/[0.04] border-white/[0.08] text-white/60' : ''}
            ${visualState === null       ? 'bg-purple-500/10 border-purple-400/20 text-purple-200' : ''}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${
            visualState === 'speaking'  ? 'bg-indigo-400' :
            visualState === 'recording' ? 'bg-rose-400 animate-pulse' :
            visualState === null        ? 'bg-purple-400 animate-pulse' :
                                          'bg-white/40'
          }`} />
          {visualState ? stateLabel : 'AI is thinking...'}
        </motion.div>

        {/* CAPTIONS — the AI's typing bubble lives here, in the conversation position */}
        <div className="w-full flex flex-col items-center gap-2.5 px-2">
          <AnimatePresence mode="wait">
            {aiThinking ? (
              <ThinkingBubble />
            ) : aiSpeaking && lastQuestion ? (
              <Captions key={`ai-${lastQuestion.slice(0, 30)}`} speaker="ai" text={lastQuestion} />
            ) : micOn ? (
              <Captions speaker="user" text={transcript || '(speak now...)'} />
            ) : !aiSpeaking && !aiThinking && lastQuestion ? (
              <Captions speaker="ai" text={lastQuestion} />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="flex flex-col items-center gap-4 pt-2">
        <MicButton
          micOn={micOn}
          aiSpeaking={aiSpeaking}
          disabled={aiThinking || isCompleting}
          onToggle={handleToggleMic}
        />

        <div className="glass rounded-xl p-3 border border-white/[0.06] w-full max-h-28 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Recent</span>
            <span className="text-[10px] text-white/30">{answerCount} answered</span>
          </div>
          {conversations.length === 0 ? (
            <p className="text-xs text-white/30 text-center py-1">Your responses will appear here</p>
          ) : (
            <div className="space-y-1.5">
              {conversations.toReversed().slice(0, 3).toReversed().map((c, i) => (
                c.answer && c.answer !== '[Code Submission]' && (
                  <p key={i} className="text-xs text-white/50 truncate flex items-start gap-1.5">
                    <FiCheckCircle className="w-3 h-3 text-emerald-400/70 mt-0.5 shrink-0" />
                    <span className="truncate">{c.answer}</span>
                  </p>
                )
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg pt-20 pb-4 flex flex-col">
      {isDSA ? (
        <div className="flex-1 flex gap-4 px-4 sm:px-6 max-w-[1400px] mx-auto w-full min-h-0">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={`min-w-0 flex flex-col ${showEditor ? 'w-1/2' : 'w-full max-w-3xl mx-auto'}`}
          >
            {conversationPanel}
          </motion.div>
          <AnimatePresence>
            {showEditor && (
              <motion.div
                key="editor-pane"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="w-1/2 min-w-0 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/20 flex items-center justify-center">
                    <FiCode className="w-3.5 h-3.5 text-cyan-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-white/80">Code Editor</h3>
                </div>
                <CodeEditor
                  onRun={handleCodeRun}
                  onSubmit={handleCodeSubmit}
                  loading={codeLoading}
                  output={codeOutput}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6"
        >
          {conversationPanel}
        </motion.div>
      )}
    </div>
  );
}
