import { motion } from 'framer-motion';

const palettes = {
  indigo:  { bg: 'from-indigo-500/10 to-indigo-500/[0.02]',  bar: 'from-indigo-400 to-indigo-500',  glow: 'rgba(99,102,241,0.4)',  text: 'text-indigo-300',  border: 'border-indigo-400/10' },
  emerald: { bg: 'from-emerald-500/10 to-emerald-500/[0.02]', bar: 'from-emerald-400 to-teal-500',   glow: 'rgba(16,185,129,0.4)',  text: 'text-emerald-300', border: 'border-emerald-400/10' },
  cyan:    { bg: 'from-cyan-500/10 to-cyan-500/[0.02]',       bar: 'from-cyan-400 to-blue-500',     glow: 'rgba(6,182,212,0.4)',   text: 'text-cyan-300',    border: 'border-cyan-400/10' },
  amber:   { bg: 'from-amber-500/10 to-amber-500/[0.02]',     bar: 'from-amber-400 to-orange-500',  glow: 'rgba(245,158,11,0.4)',  text: 'text-amber-300',   border: 'border-amber-400/10' },
  rose:    { bg: 'from-rose-500/10 to-rose-500/[0.02]',       bar: 'from-rose-400 to-pink-500',     glow: 'rgba(244,63,94,0.4)',   text: 'text-rose-300',    border: 'border-rose-400/10' },
  purple:  { bg: 'from-purple-500/10 to-purple-500/[0.02]',   bar: 'from-purple-400 to-violet-500', glow: 'rgba(168,85,247,0.4)',  text: 'text-purple-300',  border: 'border-purple-400/10' }
};

export default function ScoreCard({ label, score = 0, color = 'indigo', icon: Icon }) {
  const p = palettes[color] || palettes.indigo;
  const pct = Math.max(0, Math.min(100, score));
  const dash = 2 * Math.PI * 22;
  const offset = dash - (pct / 100) * dash;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden rounded-2xl border ${p.border} bg-gradient-to-br ${p.bg} p-4 group`}
    >
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `radial-gradient(circle, ${p.glow}, transparent 70%)` }} />

      <div className="flex items-center justify-between mb-3">
        <div className={`w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${p.text}`}>
          {Icon && <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />}
        </div>
        <div className="relative w-9 h-9">
          <svg viewBox="0 0 50 50" className="w-9 h-9 -rotate-90">
            <circle cx="25" cy="25" r="22" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
            <motion.circle
              cx="25" cy="25" r="22" fill="none"
              stroke="url(#grad)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={dash}
              initial={{ strokeDashoffset: dash }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={p.glow.replace('0.4', '1')} />
                <stop offset="100%" stopColor={p.glow.replace('0.4', '0.6')} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
            {pct}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{label}</div>
    </motion.div>
  );
}
