import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCheck, FiArrowRight, FiHome, FiZap, FiTarget, FiAlertTriangle,
  FiAward, FiCpu, FiMessageCircle, FiTrendingUp, FiBookOpen, FiCode, FiCloudOff
} from 'react-icons/fi';
import { interviewAPI } from '../services/api';
import { useAIStatus } from '../hooks/useAIStatus';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ScoreCard from '../components/dashboard/ScoreCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const recommendationMeta = {
  'strong-hire':        { variant: 'success', label: 'Strong Hire' },
  'hire':               { variant: 'info',    label: 'Hire' },
  'borderline':         { variant: 'warning', label: 'Borderline' },
  'needs-improvement':  { variant: 'danger',  label: 'Needs Improvement' }
};

const scoreKeys = [
  { key: 'overallScore',           label: 'Overall',         color: 'indigo',  icon: FiAward },
  { key: 'technicalScore',         label: 'Technical',       color: 'emerald', icon: FiCpu },
  { key: 'communicationScore',     label: 'Communication',   color: 'cyan',    icon: FiMessageCircle },
  { key: 'confidenceScore',        label: 'Confidence',      color: 'amber',   icon: FiTarget },
  { key: 'problemSolvingScore',    label: 'Problem Solving', color: 'rose',    icon: FiZap },
  { key: 'interviewReadinessScore', label: 'Readiness',      color: 'purple',  icon: FiTrendingUp }
];

const roadmapConfig = [
  { key: 'immediate', title: 'This Week',     desc: 'Quick wins to focus on now',  color: 'amber',   icon: FiZap },
  { key: 'shortTerm', title: 'Next Month',    desc: 'Build deeper competency',     color: 'indigo',  icon: FiTarget },
  { key: 'longTerm',  title: '3 Months Out',  desc: 'Long-term mastery goals',     color: 'purple',  icon: FiBookOpen }
];

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { aiAvailable } = useAIStatus();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.get(id)
      .then(res => setInterview(res.data))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg pt-20">
        <LoadingSpinner size="lg" text="Generating your feedback..." />
      </div>
    );
  }

  if (!interview) return null;

  const f = interview.feedback || {};
  const rec = recommendationMeta[f.recommendation] || { variant: 'default', label: 'No recommendation' };
  const overall = f.overallScore || 0;
  const transcript = interview.conversations?.filter(c => c.answer) || [];

  return (
    <div className="relative min-h-screen mesh-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-[10px] font-semibold tracking-wider text-emerald-300 uppercase mb-4">
            <FiCheck className="w-3 h-3" /> Interview Complete
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Here's how you <span className="text-gradient">did</span>
          </h1>
          <p className="text-white/50 mt-2">{interview.mode} Interview</p>
        </motion.div>

        {!aiAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 bg-amber-500/10 border border-amber-400/20 text-amber-200 text-sm rounded-xl px-4 py-3 mb-6"
          >
            <FiCloudOff className="w-4 h-4 shrink-0" />
            <span>AI service was unavailable during this interview. Results may be incomplete.</span>
          </motion.div>
        )}

        {/* HERO SCORE */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient className="text-center py-12 mb-8 relative overflow-hidden">
            <div className="absolute inset-0 dot-bg opacity-30" />
            <div className="relative">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-indigo-500/30 blur-3xl rounded-full" />
                <div className="relative text-7xl sm:text-8xl font-bold text-gradient mb-2">
                  {overall}%
                </div>
              </div>
              <p className="text-sm text-white/50 mb-5">Overall Performance Score</p>
              <Badge variant={rec.variant} size="lg" icon={FiAward}>
                {rec.label}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* SCORE CARDS */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8"
        >
          {scoreKeys.map(({ key, label, color, icon }) => (
            <motion.div
              key={key}
              variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
            >
              <ScoreCard label={label} score={f[key] || 0} color={color} icon={icon} />
            </motion.div>
          ))}
        </motion.div>

        {/* STRENGTHS / WEAKNESSES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center">
                  <FiCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                What you nailed
              </h2>
              {f.strengths?.length > 0 ? (
                <div className="space-y-3">
                  {f.strengths.map((s, i) => (
                    <div key={i} className="rounded-xl bg-emerald-500/[0.04] border border-emerald-400/10 p-4">
                      <Badge variant="success" size="sm" className="mb-2">{s.name}</Badge>
                      <p className="text-sm text-white/60 leading-relaxed">{s.evidence}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">No specific strengths identified yet.</p>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-400/20 flex items-center justify-center">
                  <FiAlertTriangle className="w-3.5 h-3.5 text-rose-300" />
                </div>
                Where to level up
              </h2>
              {f.weaknesses?.length > 0 ? (
                <div className="space-y-3">
                  {f.weaknesses.map((w, i) => (
                    <div key={i} className="rounded-xl bg-rose-500/[0.04] border border-rose-400/10 p-4">
                      <Badge variant="danger" size="sm" className="mb-2">{w.name}</Badge>
                      <p className="text-sm text-white/60 leading-relaxed">{w.evidence}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40">No specific weaknesses identified yet.</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* ROADMAP */}
        {f.improvementRoadmap && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="mb-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                <FiBookOpen className="w-4 h-4 text-indigo-400" />
                Your improvement roadmap
              </h2>
              <p className="text-sm text-white/50 mb-6">A practical plan to level up your interview game.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roadmapConfig.map((section, idx) => {
                  const items = f.improvementRoadmap[section.key] || [];
                  const colorMap = {
                    amber:  { bg: 'bg-amber-500/[0.04]',  border: 'border-amber-400/15',  text: 'text-amber-300',  iconBg: 'bg-amber-500/10',  iconBorder: 'border-amber-400/20' },
                    indigo: { bg: 'bg-indigo-500/[0.04]', border: 'border-indigo-400/15', text: 'text-indigo-300', iconBg: 'bg-indigo-500/10', iconBorder: 'border-indigo-400/20' },
                    purple: { bg: 'bg-purple-500/[0.04]', border: 'border-purple-400/15', text: 'text-purple-300', iconBg: 'bg-purple-500/10', iconBorder: 'border-purple-400/20' }
                  };
                  const c = colorMap[section.color];
                  const Icon = section.icon;
                  return (
                    <div key={section.key} className={`rounded-2xl ${c.bg} border ${c.border} p-5`}>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className={`w-7 h-7 rounded-lg ${c.iconBg} border ${c.iconBorder} flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 ${c.text}`} />
                        </div>
                        <h3 className={`text-sm font-semibold ${c.text}`}>{section.title}</h3>
                      </div>
                      <p className="text-[11px] text-white/40 mb-4">{section.desc}</p>
                      {items.length > 0 ? (
                        <ul className="space-y-2.5">
                          {items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70 leading-relaxed">
                              <span className={`w-1 h-1 rounded-full ${c.text.replace('text-', 'bg-')} mt-2 shrink-0`} />
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-white/30">No items</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        )}

        {/* TRANSCRIPT */}
        {transcript.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card className="mb-8">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
                <FiMessageCircle className="w-4 h-4 text-cyan-400" />
                Interview transcript
              </h2>
              <p className="text-sm text-white/50 mb-5">Everything you and the AI discussed.</p>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {transcript.map((c, i) => (
                  <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300 shrink-0 mt-0.5">Q</span>
                      <p className="text-sm text-white/80 leading-relaxed">{c.question}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300 shrink-0 mt-0.5">A</span>
                      <p className="text-sm text-white/60 leading-relaxed">
                        {c.answer === '[Code Submission]'
                          ? <span className="inline-flex items-center gap-1.5"><FiCode className="w-3.5 h-3.5 text-cyan-400" /> Submitted a code solution</span>
                          : c.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link to="/interview/setup">
            <Button size="lg" icon={FiZap} iconRight={FiArrowRight}>
              Practice again
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="lg" icon={FiHome}>
              Back to dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
