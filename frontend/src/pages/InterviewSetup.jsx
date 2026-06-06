import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiArrowRight, FiUpload, FiFileText, FiCheck, FiX, FiZap, FiSkipForward,
  FiUser, FiTarget, FiAlertCircle
} from 'react-icons/fi';
import { interviewAPI, resumeAPI } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ModeSelector from '../components/interview/ModeSelector';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const steps = [
  { id: 1, title: 'Resume', desc: 'Personalize your questions' },
  { id: 2, title: 'Mode',   desc: 'Choose your interview style' }
];

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [modes, setModes] = useState([]);
  const [selectedMode, setSelectedMode] = useState('');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  const [existingProfile, setExistingProfile] = useState(null);
  const [resumeChoice, setResumeChoice] = useState(null);
  const [newProfile, setNewProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState(1);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      interviewAPI.getModes(),
      resumeAPI.get().catch(() => ({ data: null }))
    ]).then(([modesRes, resumeRes]) => {
      setModes(modesRes.data);
      if (resumeRes.data?.profile) {
        setExistingProfile(resumeRes.data.profile);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('resume', file);
    resumeAPI.upload(fd)
      .then(res => {
        setNewProfile(res.data.profile);
        setResumeChoice('new');
        setStep(2);
      })
      .catch(err => setError(err.response?.data?.message || 'Upload failed'))
      .finally(() => setUploading(false));
  };

  const useExisting = () => {
    setResumeChoice('existing');
    setStep(2);
  };

  const skipResume = () => {
    setResumeChoice('skip');
    setStep(2);
  };

  const activeProfile = resumeChoice === 'new' ? newProfile :
    resumeChoice === 'existing' ? existingProfile : null;

  const handleStart = async () => {
    if (!selectedMode) return;
    setStarting(true);
    try {
      const res = await interviewAPI.start(selectedMode);
      navigate(`/interview/${res.data.interviewId}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start interview');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 mesh-bg">
        <LoadingSpinner size="lg" text="Loading interview modes..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen mesh-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase mb-4">
            <FiZap className="w-3 h-3" /> Setup
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Let's get you <span className="text-gradient">interview-ready</span>
          </h1>
          <p className="text-white/50 mt-2">Two quick steps and you're in.</p>
        </motion.div>

        {/* STEPPER */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => {
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`
                      w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all
                      ${done ? 'bg-emerald-500 border-emerald-400 text-white'
                        : active ? 'bg-gradient-to-br from-indigo-500 to-purple-500 border-indigo-400 text-white shadow-[0_0_16px_-2px_rgba(99,102,241,0.5)]'
                        : 'bg-white/[0.04] border-white/[0.08] text-white/40'}
                    `}
                  >
                    {done ? <FiCheck className="w-3.5 h-3.5" strokeWidth={3} /> : s.id}
                  </div>
                  <div className="hidden sm:block">
                    <p className={`text-xs font-semibold ${active || done ? 'text-white' : 'text-white/40'}`}>{s.title}</p>
                    <p className="text-[10px] text-white/30">{s.desc}</p>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-8 sm:w-16 h-px bg-white/[0.08] mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm rounded-xl px-3.5 py-3 mb-6"
          >
            <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="resume-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {existingProfile && (
                <Card hover className="group cursor-pointer" onClick={useExisting}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/20 flex items-center justify-center shrink-0">
                      <FiFileText className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-base font-semibold text-white">Use saved resume</h3>
                        <Badge variant="success" size="sm" icon={FiCheck}>Saved</Badge>
                      </div>
                      <p className="text-sm text-white/50 mb-3">Your profile is on file. We'll tailor questions to it.</p>
                      <div className="flex flex-wrap gap-1.5">
                        {existingProfile.skills?.slice(0, 5).map((s, i) => (
                          <Badge key={i} variant="info" size="sm">{s}</Badge>
                        ))}
                        {(existingProfile.skills?.length || 0) > 5 && (
                          <Badge size="sm">+{existingProfile.skills.length - 5}</Badge>
                        )}
                      </div>
                    </div>
                    <FiArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              )}

              <Card hover className="group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0">
                    {uploading ? <LoadingSpinner size="sm" /> : <FiUpload className="w-5 h-5 text-indigo-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {existingProfile ? 'Upload a new resume' : 'Upload your resume'}
                    </h3>
                    <p className="text-sm text-white/50">
                      {uploading ? 'Analyzing your resume with AI...' : 'Get questions tailored to your skills and projects.'}
                    </p>
                    <p className="text-[11px] text-white/30 mt-2">PDF only · max 5MB</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <input ref={fileRef} type="file" accept=".pdf" onChange={handleFileChange} className="hidden" disabled={uploading} />
              </Card>

              <Card hover className="group cursor-pointer" onClick={skipResume}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <FiSkipForward className="w-5 h-5 text-white/50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">Skip resume</h3>
                    <p className="text-sm text-white/50">Start with generic questions for your chosen mode.</p>
                  </div>
                  <FiArrowRight className="w-5 h-5 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="mode-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeProfile && (
                <Card padding="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                      <FiUser className="w-3 h-3" /> Profile
                    </h3>
                    <button
                      onClick={() => { setStep(1); setResumeChoice(null); setNewProfile(null); }}
                      className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1"
                    >
                      <FiX className="w-3 h-3" /> Change
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activeProfile.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {activeProfile.skills.slice(0, 10).map((s, i) => (
                          <Badge key={i} variant="info" size="sm">{s}</Badge>
                        ))}
                      </div>
                    )}
                    {activeProfile.experienceLevel && (
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <FiTarget className="w-3 h-3" />
                        Level: <span className="text-white font-medium capitalize">{activeProfile.experienceLevel}</span>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Card>
                <h3 className="text-lg font-semibold text-white mb-1">Pick your mode</h3>
                <p className="text-sm text-white/50 mb-5">10 modes covering the most common interview styles.</p>
                <ModeSelector modes={modes} selected={selectedMode} onSelect={setSelectedMode} />
              </Card>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button
                  size="lg"
                  onClick={handleStart}
                  loading={starting}
                  disabled={!selectedMode}
                  iconRight={FiArrowRight}
                >
                  Start Interview
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
