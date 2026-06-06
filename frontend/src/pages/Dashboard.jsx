import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiZap, FiArrowRight, FiMic, FiTrendingUp, FiTarget, FiClock,
  FiAward, FiBarChart2, FiMessageCircle, FiCpu, FiFileText,
  FiAlertTriangle, FiCheckCircle, FiPlus
} from 'react-icons/fi';
import { analyticsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ScoreCard from '../components/dashboard/ScoreCard';
import ProgressChart from '../components/dashboard/ProgressChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const scoreKeys = [
  { key: 'overall',        label: 'Overall',         color: 'indigo',  icon: FiAward },
  { key: 'technical',      label: 'Technical',       color: 'emerald', icon: FiCpu },
  { key: 'communication',  label: 'Communication',   color: 'cyan',    icon: FiMessageCircle },
  { key: 'confidence',     label: 'Confidence',      color: 'amber',   icon: FiTarget },
  { key: 'problemSolving', label: 'Problem Solving', color: 'rose',    icon: FiZap },
  { key: 'readiness',      label: 'Readiness',       color: 'purple',  icon: FiBarChart2 }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 mesh-bg">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const scores = data?.averageScores || {};
  const recentInterviews = data?.recentInterviews || [];
  const recentScores = data?.recentScores || [];
  const modePerformance = data?.modePerformance || [];
  const profile = data?.profile;
  const hasData = data?.totalInterviews > 0;
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="relative min-h-screen mesh-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm rounded-xl px-4 py-3 mb-6">
            <FiAlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div>
            <p className="text-sm text-white/40 mb-1.5 flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
              </span>
              {greeting}
            </p>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              {user?.name?.split(' ')[0] || 'Friend'} 👋
            </h1>
            <p className="text-white/50 mt-1">
              {hasData
                ? `You've completed ${data.totalInterviews} interview${data.totalInterviews !== 1 ? 's' : ''}. Keep going.`
                : 'Ready to start your first interview?'}
            </p>
          </div>
          <Link to="/interview/setup">
            <Button size="lg" icon={FiPlus} iconRight={FiArrowRight}>
              New Interview
            </Button>
          </Link>
        </motion.div>

        {!hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center py-20 relative overflow-hidden" gradient>
              <div className="absolute inset-0 dot-bg opacity-30" />
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-6 shadow-[0_12px_32px_-6px_rgba(99,102,241,0.6)] animate-float">
                  <FiMic className="w-9 h-9 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Your journey starts here</h2>
                <p className="text-white/50 max-w-md mx-auto mb-8">
                  Upload your resume and dive into a real-time AI interview.
                  Get scored, get feedback, get better.
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
                  <ScoreCard label={label} score={scores[key] || 0} color={color} icon={icon} />
                </motion.div>
              ))}
            </motion.div>

            {/* CHARTS + MODES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FiTrendingUp className="w-4 h-4 text-indigo-400" />
                        Score Progress
                      </h2>
                      <p className="text-xs text-white/40 mt-0.5">Your last {recentScores.length} interviews</p>
                    </div>
                  </div>
                  {recentScores.length > 1 ? (
                    <div className="grid grid-cols-2 gap-4">
                      <ProgressChart data={recentScores.map(s => s?.overall ?? 0)}       color="indigo"  label="Overall"       />
                      <ProgressChart data={recentScores.map(s => s?.technical ?? 0)}     color="emerald" label="Technical"     />
                      <ProgressChart data={recentScores.map(s => s?.communication ?? 0)} color="cyan"    label="Communication" />
                      <ProgressChart data={recentScores.map(s => s?.confidence ?? 0)}    color="amber"   label="Confidence"    />
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-white/40">
                      Complete at least 2 interviews to see progress trends.
                    </div>
                  )}
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Card className="h-full">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                    <FiBarChart2 className="w-4 h-4 text-purple-400" />
                    Mode Performance
                  </h2>
                  {modePerformance.length > 0 ? (
                    <div className="space-y-2.5">
                      {modePerformance.map((m) => {
                        const score = parseInt(m.avgScore) || 0;
                        return (
                          <div key={m.mode} className="group">
                            <div className="flex items-center justify-between text-sm mb-1.5">
                              <span className="text-white/70 truncate">{m.mode}</span>
                              <span className="text-xs text-white/40">{m.avgScore}% · {m.count}x</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${score}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                                className={`h-full rounded-full ${
                                  score >= 70 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                                  score >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                                                 'bg-gradient-to-r from-rose-400 to-pink-400'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 text-center py-6">No data yet.</p>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* RECENT + PROFILE */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="lg:col-span-3"
              >
                <Card>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-cyan-400" />
                      Recent Interviews
                    </h2>
                    {recentInterviews.length > 0 && (
                      <Link to="/history" className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1">
                        View all <FiArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  {recentInterviews.length > 0 ? (
                    <div className="space-y-2.5">
                      {recentInterviews.slice(0, 4).map((i) => {
                        const score = i.score || 0;
                        return (
                          <Link
                            key={i.id}
                            to={`/results/${i.id}`}
                            className="group flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                          >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/20 flex items-center justify-center text-xs font-bold text-indigo-200 shrink-0">
                              {i.mode?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{i.mode}</p>
                              <p className="text-xs text-white/40 mt-0.5">
                                {i.date ? new Date(i.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                              </p>
                            </div>
                            <Badge
                              variant={score >= 70 ? 'success' : score >= 40 ? 'warning' : 'danger'}
                              size="md"
                            >
                              {score}%
                            </Badge>
                            <FiArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all" />
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-white/40 text-center py-6">No interviews yet.</p>
                  )}
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="lg:col-span-2"
              >
                <Card>
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-5">
                    <FiFileText className="w-4 h-4 text-amber-400" />
                    Your Profile
                  </h2>
                  {profile ? (
                    <div className="space-y-5">
                      <div>
                        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Top Skills</p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.skills?.slice(0, 8).map((s, i) => (
                            <Badge key={i} variant="info" size="sm">{s}</Badge>
                          ))}
                          {(profile.skills?.length || 0) > 8 && (
                            <Badge size="sm">+{profile.skills.length - 8}</Badge>
                          )}
                        </div>
                      </div>
                      {profile.strengths?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-emerald-300/80 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FiCheckCircle className="w-3 h-3" /> Strengths
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.strengths.slice(0, 4).map((s, i) => (
                              <Badge key={i} variant="success" size="sm">{s}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.weakAreas?.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold text-rose-300/80 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FiAlertTriangle className="w-3 h-3" /> Focus Areas
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {profile.weakAreas.slice(0, 4).map((w, i) => (
                              <Badge key={i} variant="danger" size="sm">{w}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      <Link to="/interview/setup">
                        <Button variant="secondary" size="sm" className="w-full" iconRight={FiArrowRight}>
                          Update Resume
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <FiFileText className="w-10 h-10 text-white/20 mx-auto mb-3" />
                      <p className="text-sm text-white/50 mb-4">Upload your resume to unlock personalized questions.</p>
                      <Link to="/interview/setup">
                        <Button size="sm" icon={FiFileText}>Upload Resume</Button>
                      </Link>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
