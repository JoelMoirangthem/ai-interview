import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiPlus, FiZap, FiClock, FiTrendingUp, FiTrendingDown,
  FiMinus, FiBarChart2, FiAward, FiActivity
} from 'react-icons/fi';
import { interviewAPI } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const MODE_COLORS = {
  'Frontend Developer': 'info',
  'Backend Developer': 'success',
  'MERN Stack Developer': 'purple',
  'Python Developer': 'info',
  'Data Structures & Algorithms': 'purple',
  'HR Interview': 'success',
  'System Design': 'warning',
  'Custom Interview': 'default'
};

const colorMap = {
  indigo:  '#818cf8',
  emerald: '#34d399',
  cyan:    '#22d3ee',
  amber:   '#fbbf24',
  rose:    '#fb7185',
  purple:  '#c084fc'
};

function ScoreBadge({ score }) {
  const variant = score >= 70 ? 'success' : score >= 45 ? 'warning' : 'danger';
  return <Badge variant={variant} size="md">{score}%</Badge>;
}

function MiniChart({ scores }) {
  if (!scores || scores.length < 2) return null;
  const max = 100, h = 32, w = 80;
  const step = w / (scores.length - 1);
  const points = scores.map((s, i) => `${i * step},${h - (s / max) * h}`).join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-8">
      <defs>
        <linearGradient id="mc-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`${points} ${w},${h} 0,${h}`} fill="url(#mc-grad)" />
      <polyline fill="none" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewAPI.getHistory()
      .then(res => setInterviews(res.data || []))
      .catch(() => setInterviews([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (interviews.length === 0) return null;
    const completed = interviews.filter(i => i.status === 'completed');
    const scores = completed.map(i => i.feedback?.overallScore || 0);
    return {
      total: completed.length,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      best: scores.length ? Math.max(...scores) : 0,
      latest: scores.length ? scores[scores.length - 1] : 0,
      trend: scores.length >= 3 ? (
        scores.slice(-3).reduce((a, b) => a + b, 0) / 3 >= scores.slice(-4, -1).reduce((a, b) => a + b, 0) / 3
      ) : null
    };
  }, [interviews]);

  const modeBreakdown = useMemo(() => {
    const map = {};
    interviews.filter(i => i.status === 'completed').forEach(i => {
      if (!map[i.mode]) map[i.mode] = { count: 0, total: 0, best: 0 };
      const s = i.feedback?.overallScore || 0;
      map[i.mode].count++;
      map[i.mode].total += s;
      if (s > map[i.mode].best) map[i.mode].best = s;
    });
    return Object.entries(map).map(([mode, d]) => ({
      mode, count: d.count, avg: Math.round(d.total / d.count), best: d.best
    })).sort((a, b) => b.count - a.count);
  }, [interviews]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg pt-20">
        <LoadingSpinner size="lg" text="Loading history..." />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen mesh-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase mb-3">
              <FiClock className="w-3 h-3" /> Your journey
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight">Performance history</h1>
            <p className="text-white/50 mt-1.5">Track your interview progress over time</p>
          </div>
          <Link to="/interview/setup">
            <Button size="lg" icon={FiPlus} iconRight={FiArrowRight}>
              New Interview
            </Button>
          </Link>
        </motion.div>

        {interviews.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center py-20 relative overflow-hidden" gradient>
              <div className="absolute inset-0 dot-bg opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-[0_12px_32px_-6px_rgba(99,102,241,0.6)] animate-float">
                  <FiActivity className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">No interviews yet</h2>
                <p className="text-white/50 max-w-md mx-auto mb-8">
                  Once you complete a practice round, your full history and analytics will live here.
                </p>
                <Link to="/interview/setup">
                  <Button size="lg" icon={FiZap} iconRight={FiArrowRight}>
                    Start your first interview
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* STATS */}
            {stats && (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8"
              >
                {[
                  { label: 'Total Interviews', value: stats.total,                                icon: FiActivity,    color: 'indigo' },
                  { label: 'Average Score',    value: `${stats.avg}%`,                              icon: FiBarChart2,   color: stats.avg >= 70 ? 'emerald' : 'amber' },
                  { label: 'Best Score',       value: `${stats.best}%`,                             icon: FiAward,       color: 'emerald' },
                  {
                    label: 'Trend',
                    value: stats.trend === null ? '—' : stats.trend ? 'Up' : 'Down',
                    icon: stats.trend === null ? FiMinus : stats.trend ? FiTrendingUp : FiTrendingDown,
                    color: stats.trend ? 'emerald' : stats.trend === false ? 'rose' : 'default'
                  }
                ].map((s, i) => {
                  const Icon = s.icon;
                  const iconBox = {
                    indigo:  { bg: 'bg-indigo-500/10',  border: 'border-indigo-400/20',  text: 'text-indigo-300' },
                    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-400/20', text: 'text-emerald-300' },
                    amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-400/20',   text: 'text-amber-300' },
                    rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-400/20',    text: 'text-rose-300' },
                    default: { bg: 'bg-white/[0.04]',   border: 'border-white/[0.08]',   text: 'text-white/50' }
                  }[s.color];
                  return (
                    <motion.div
                      key={i}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    >
                      <Card>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg ${iconBox.bg} border ${iconBox.border} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${iconBox.text}`} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-white">{s.value}</p>
                        <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* MODE BREAKDOWN */}
            {modeBreakdown.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="mb-6">
                  <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <FiBarChart2 className="w-3.5 h-3.5 text-purple-400" />
                    Performance by mode
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {modeBreakdown.map(m => {
                      const score = m.avg;
                      return (
                        <div key={m.mode} className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4 text-center hover:bg-white/[0.04] transition-colors">
                          <p className="text-[11px] text-white/50 truncate mb-2 font-medium">{m.mode}</p>
                          <p className="text-2xl font-bold text-white mb-1">{score}%</p>
                          <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden mb-2">
                            <div
                              className={`h-full rounded-full ${
                                score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                                score >= 45 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                                               'bg-gradient-to-r from-rose-400 to-pink-400'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-white/30">{m.count} taken · best {m.best}%</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* INTERVIEWS LIST */}
            <div className="space-y-2.5">
              {interviews.map((i, idx) => {
                const score = i.feedback?.overallScore || 0;
                const scores = i.feedback ? [
                  i.feedback.technicalScore, i.feedback.communicationScore,
                  i.feedback.confidenceScore, i.feedback.problemSolvingScore
                ].filter(s => s != null) : [];

                return (
                  <motion.div
                    key={i._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.03 }}
                  >
                    <Link to={`/results/${i._id}`}>
                      <Card hover className="group">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 flex items-center justify-center text-sm font-bold text-indigo-200 shrink-0">
                            {i.mode?.charAt(0) || 'I'}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-sm font-semibold text-white truncate">{i.mode}</span>
                              <Badge
                                variant={i.status === 'completed' ? 'success' : 'warning'}
                                size="sm"
                                className="capitalize"
                              >
                                {i.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-white/40 flex items-center gap-1">
                              <FiClock className="w-3 h-3" />
                              {new Date(i.startedAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {scores.length > 1 && <MiniChart scores={scores} />}
                            <ScoreBadge score={score} />
                            <FiArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
