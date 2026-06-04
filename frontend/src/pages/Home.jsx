import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  motion, useScroll, useTransform, useSpring, useMotionValue,
  useInView, AnimatePresence
} from 'framer-motion';
import {
  FiZap, FiMic, FiFileText, FiCode, FiBarChart2, FiArrowRight,
  FiCheck, FiPlay, FiTarget, FiMessageSquare, FiCpu, FiAward, FiShield
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const ease = [0.16, 1, 0.3, 1];

/* ============================================================
   1. Animated mesh-gradient background with mouse-tracked orbs
   ============================================================ */
function AnimatedBackground() {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const onMove = (e) => {
      const { innerWidth, innerHeight } = window;
      mx.set((e.clientX / innerWidth - 0.5) * 60);
      my.set((e.clientY / innerHeight - 0.5) * 60);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 mesh-bg" />
      <div className="absolute inset-0 grid-bg opacity-60" />

      <motion.div
        style={{ x: sx, y: sy }}
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/20 blur-[120px] animate-breathe"
      />
      <motion.div
        style={{ x: useTransform(sx, v => -v), y: useTransform(sy, v => -v), animationDelay: '2s' }}
        className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[120px] animate-breathe"
      />
      <div className="absolute bottom-1/4 left-1/2 w-[400px] h-[400px] -translate-x-1/2 rounded-full bg-pink-500/10 blur-[120px] animate-breathe" style={{ animationDelay: '4s' }} />
    </div>
  );
}

/* ============================================================
   2. Floating particles
   ============================================================ */
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 12,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1
    })), []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [p.opacity, p.opacity * 1.5, p.opacity]
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   3. Animated number counter
   ============================================================ */
function Counter({ value, suffix = '', duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const numeric = parseInt(String(value).replace(/[^0-9]/g, ''), 10) || 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * numeric));
      if (p < 1) requestAnimationFrame(tick);
      else setDisplay(numeric);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  const prefix = String(value).startsWith('<') ? '<' : '';
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ============================================================
   4. Animated headline — word by word reveal
   ============================================================ */
const headline = ['Ace', 'your', 'next'];
const headlineGradient = ['tech', 'interview'];

function AnimatedHeadline() {
  return (
    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.05]">
      <span className="block">
        {headline.map((word, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease }}
            className="inline-block mr-3"
          >
            {word}
          </motion.span>
        ))}
      </span>
      <span className="block">
        {headlineGradient.map((word, i) => (
          <motion.span
            key={i}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 + i * 0.1, ease }}
            className="inline-block mr-3 relative"
          >
            <span className="text-gradient">{word}</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease }}
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent origin-left"
            />
          </motion.span>
        ))}
      </span>
    </h1>
  );
}

/* ============================================================
   5. Magnetic button — follows cursor
   ============================================================ */
function MagneticLink({ to, children, primary = false }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 250, damping: 15 });
  const sy = useSpring(my, { stiffness: 250, damping: 15 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    mx.set(x * 0.25);
    my.set(y * 0.25);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      <Link
        to={to}
        className={`
          group relative inline-flex items-center gap-2.5 h-12 px-6 text-sm font-semibold rounded-xl
          overflow-hidden transition-all duration-200
          ${primary
            ? 'text-white bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 shadow-[0_8px_24px_-6px_rgba(99,102,241,0.6)] hover:shadow-[0_16px_40px_-6px_rgba(99,102,241,0.8)]'
            : 'text-white/80 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.16]'
          }
        `}
      >
        {primary && (
          <>
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          </>
        )}
        {children}
      </Link>
    </motion.div>
  );
}

/* ============================================================
   6. Live waveform — actually animated SVG
   ============================================================ */
function LiveWaveform({ color = '#34d399', bars = 24 }) {
  return (
    <div className="flex items-center gap-[3px] h-7">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full"
          style={{ background: color, transformOrigin: 'center' }}
          animate={{
            scaleY: [0.3, 1.2, 0.5, 0.9, 0.4, 1, 0.3]
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.06,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   7. 3D Tilt card
   ============================================================ */
function TiltCard({ children, className = '', glowColor = 'rgba(99,102,241,0.4)' }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ry.set(x * 8);
    rx.set(-y * 8);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d', transformPerspective: 1000 }}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   8. The browser mock — animated dashboard preview
   ============================================================ */
function BrowserMock() {
  return (
    <TiltCard>
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl" />
      <div className="relative glass-strong rounded-3xl p-1 shadow-2xl">
        <div className="rounded-2xl bg-[#0a0b10] p-5 sm:p-7">
          {/* Window chrome */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            <div className="ml-3 px-3 py-0.5 rounded-md bg-white/[0.04] text-[10px] text-white/30 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              prepai.app/interview
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {/* AI bubble */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <FiCpu className="w-4 h-4 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#0a0b10]" />
                </div>
                <span className="text-xs font-semibold text-white/80">AI Interviewer</span>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto text-[10px] text-emerald-300 font-medium"
                >
                  speaking
                </motion.span>
              </div>
              <p className="text-sm text-white/75 leading-relaxed">
                "Walk me through a time you had to optimize a slow database query in production. What tradeoffs did you consider?"
              </p>
            </motion.div>

            {/* User bubble with live waveform */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <FiMic className="w-4 h-4 text-white" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-400 animate-pulse border-2 border-[#0a0b10]" />
                </div>
                <span className="text-xs font-semibold text-white/80">You</span>
                <span className="ml-auto text-[10px] text-rose-300 font-medium flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-rose-400 animate-pulse" />
                  listening
                </span>
              </div>
              <LiveWaveform color="#34d399" bars={28} />
            </motion.div>
          </div>

          {/* Score row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="mt-4 grid grid-cols-3 gap-2"
          >
            {[
              { label: 'Technical', score: 87, color: 'from-emerald-400 to-teal-400' },
              { label: 'Communication', score: 92, color: 'from-cyan-400 to-blue-400' },
              { label: 'Confidence', score: 78, color: 'from-amber-400 to-orange-400' }
            ].map((m, i) => (
              <div key={i} className="rounded-lg bg-white/[0.02] border border-white/[0.04] p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-white/50 font-medium">{m.label}</span>
                  <span className="text-[10px] text-white font-bold">{m.score}</span>
                </div>
                <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.score}%` }}
                    transition={{ delay: 1.8 + i * 0.15, duration: 1.2, ease }}
                    className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </TiltCard>
  );
}

/* ============================================================
   9. Floating decorative cards
   ============================================================ */
function FloatingCard({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 + delay, duration: 0.8, ease }}
      className={`absolute ${className}`}
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: 'easeInOut', delay: delay * 0.5 }}
        style={{ transformStyle: 'preserve-3d' }}
        className="glass rounded-2xl p-3 shadow-2xl shadow-black/40"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   10. Reveal-on-scroll wrapper
   ============================================================ */
function Reveal({ children, delay = 0, y = 30, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   11. Infinite marquee
   ============================================================ */
function Marquee({ items, direction = 'left', speed = 30 }) {
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex gap-3 w-max"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`
        }}
      >
        {[...items, ...items, ...items].map((m, i) => (
          <span
            key={i}
            className="px-5 py-2.5 text-sm font-medium text-white/80 glass rounded-xl whitespace-nowrap hover:text-white hover:border-white/20 transition-colors"
          >
            {m}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
        @keyframes marquee-right {
          from { transform: translateX(-33.33%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   12. Scroll-progress indicator (thin top bar)
   ============================================================ */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 origin-left z-50"
    />
  );
}

/* ============================================================
   Page
   ============================================================ */
const features = [
  { icon: FiMic,          title: 'Real-time Voice',     desc: 'Talk naturally with an AI interviewer that listens, responds, and adapts in real time.',         color: 'indigo' },
  { icon: FiFileText,     title: 'Resume-Aware',         desc: 'Upload your resume. The AI tailors every question to your actual experience.',                  color: 'purple' },
  { icon: FiCode,         title: 'Live Code Editor',     desc: 'For DSA rounds, get a Monaco editor with multi-language execution built in.',                    color: 'cyan' },
  { icon: FiTarget,       title: 'Adaptive Difficulty',  desc: 'Questions evolve with your performance. Easy to medium to hard, smoothly.',                    color: 'amber' },
  { icon: FiBarChart2,    title: 'Deep Analytics',       desc: 'Track scores across technical accuracy, communication, confidence and more.',                  color: 'emerald' },
  { icon: FiMessageSquare,title: 'Actionable Feedback',  desc: 'Get a personalized roadmap with strengths, gaps, and what to practice next.',                   color: 'pink' }
];

const colorMap = {
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-300',  border: 'border-indigo-400/20', glow: 'rgba(99,102,241,0.4)' },
  purple:  { bg: 'bg-purple-500/10',  text: 'text-purple-300',  border: 'border-purple-400/20', glow: 'rgba(168,85,247,0.4)' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-300',    border: 'border-cyan-400/20',    glow: 'rgba(6,182,212,0.4)' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-300',   border: 'border-amber-400/20',   glow: 'rgba(245,158,11,0.4)' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-400/20', glow: 'rgba(16,185,129,0.4)' },
  pink:    { bg: 'bg-pink-500/10',    text: 'text-pink-300',    border: 'border-pink-400/20',    glow: 'rgba(236,72,153,0.4)' }
};

const stats = [
  { value: '10',  suffix: '+',   label: 'Interview Modes',     icon: FiCpu,        color: 'indigo'  },
  { value: '6',   suffix: '',    label: 'Score Dimensions',    icon: FiBarChart2,  color: 'cyan'    },
  { value: '120', suffix: 's',  label: 'To Start',            icon: FiZap,        color: 'amber'   },
  { value: '100', suffix: '%',  label: 'Free Forever',        icon: FiShield,     color: 'emerald' }
];

const modes = [
  'Frontend', 'Backend', 'MERN Stack', 'Full Stack',
  'Java', 'Python', 'DSA', 'HR', 'System Design', 'Custom'
];

export default function Home() {
  const { user } = useAuth();
  const ctaLink = user ? '/interview/setup' : '/auth';

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ScrollProgress />
      <AnimatedBackground />
      <FloatingParticles />

      {/* === HERO === */}
      <section className="relative pt-32 pb-24 sm:pt-40 sm:pt-48">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease }}
              className="inline-flex mb-7"
            >
              <span className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-white/70 hover:bg-white/[0.08] hover:border-white/[0.16] transition-all cursor-default">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>Powered by advanced AI</span>
                <span className="w-px h-3 bg-white/10" />
                <span className="text-emerald-300 font-semibold">100% free</span>
              </span>
            </motion.div>

            <AnimatedHeadline />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease }}
              className="mt-7 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed"
            >
              Practice with a voice-driven AI that thinks like a real interviewer.
              Resume-aware questions, live code editor, instant feedback — without the cost.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85, ease }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <MagneticLink to={ctaLink} primary>
                <FiZap className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Start practicing free</span>
                <FiArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
              </MagneticLink>
              <MagneticLink to="#features">
                <FiPlay className="w-3.5 h-3.5" />
                <span>See how it works</span>
              </MagneticLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.1 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/40"
            >
              {['No credit card', 'No signup friction', 'Works in your browser'].map((t, i) => (
                <motion.span
                  key={t}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center">
                    <FiCheck className="w-2 h-2 text-emerald-400" strokeWidth={3} />
                  </span>
                  {t}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* MOCK + floating decoratives */}
          <div className="relative mt-20 max-w-5xl mx-auto">
            <BrowserMock />

            <FloatingCard className="hidden lg:flex items-center gap-2.5 -top-6 -left-12" delay={0}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 border border-indigo-400/30 flex items-center justify-center">
                <FiZap className="w-4 h-4 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Real-time</p>
                <p className="text-xs text-white font-semibold">AI responds in 0.8s</p>
              </div>
            </FloatingCard>

            <FloatingCard className="hidden lg:flex items-center gap-2.5 -bottom-4 -right-8" delay={0.3}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border border-emerald-400/30 flex items-center justify-center">
                <FiAward className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Avg score</p>
                <p className="text-xs text-white font-semibold">+24% improvement</p>
              </div>
            </FloatingCard>
          </div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="flex justify-center mt-20"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-white/30"
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>
        </motion.div>
      </section>

      {/* === STATS === */}
      <section className="relative py-16 border-y border-white/[0.04]">
        <div className="absolute inset-0 mesh-bg opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              const c = colorMap[s.color];
              return (
                <Reveal key={s.label} delay={i * 0.1}>
                  <div className="text-center group">
                    <div className={`inline-flex w-10 h-10 rounded-xl ${c.bg} ${c.border} border items-center justify-center ${c.text} mb-3 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-3xl sm:text-4xl font-bold text-white">
                      <Counter value={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[10px] text-white/40 mt-1.5 tracking-[0.15em] uppercase font-medium">{s.label}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" className="relative py-28 sm:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Built for <span className="text-gradient">real interviews</span>
            </h2>
            <p className="mt-4 text-white/60">
              Every detail designed to feel like a real conversation, not a quiz.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              const c = colorMap[f.color];
              return (
                <Reveal key={f.title} delay={i * 0.08}>
                  <TiltCard glowColor={c.glow} className="group h-full">
                    <div className="relative h-full glass rounded-2xl p-6 overflow-hidden border border-white/[0.05] hover:border-white/[0.12] transition-all duration-500">
                      <div
                        className={`absolute -top-20 -right-20 w-48 h-48 ${c.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                        style={{ boxShadow: `inset 0 0 0 1px ${c.glow.replace('0.4', '0.2')}` }}
                      />
                      <div className={`relative w-12 h-12 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center ${c.text} mb-5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3`}>
                        <Icon className="w-5 h-5" strokeWidth={2} />
                      </div>
                      <h3 className="relative text-base font-semibold text-white mb-2 group-hover:text-white transition-colors">
                        {f.title}
                      </h3>
                      <p className="relative text-sm text-white/50 leading-relaxed">{f.desc}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* === MARQUEE MODES === */}
      <section className="relative py-20 border-y border-white/[0.04] overflow-hidden">
        <Reveal className="text-center max-w-2xl mx-auto mb-10 px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            <span className="text-gradient-cool">10+</span> interview modes
          </h2>
          <p className="mt-3 text-white/60 text-sm">From frontend to system design — pick what you're prepping for.</p>
        </Reveal>
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#06070b] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#06070b] to-transparent z-10 pointer-events-none" />
            <Marquee items={modes} direction="left" speed={40} />
          </div>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#06070b] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#06070b] to-transparent z-10 pointer-events-none" />
            <Marquee items={[...modes].reverse()} direction="right" speed={45} />
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="relative py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1/2 bg-gradient-conic from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-60"
              />
              <div className="relative glass-strong rounded-3xl p-10 sm:p-16 text-center overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-40" />
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-5 shadow-[0_12px_32px_-6px_rgba(99,102,241,0.6)]"
                  >
                    <FiAward className="w-7 h-7 text-white" />
                  </motion.div>
                  <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                    Ready to <span className="text-gradient">level up</span>?
                  </h2>
                  <p className="mt-3 text-white/60 max-w-lg mx-auto">
                    Your next interview is closer than you think. Start a free practice round in under two minutes.
                  </p>
                  <div className="mt-8">
                    <MagneticLink to={ctaLink} primary>
                      <FiZap className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Get started — it's free</span>
                      <FiArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                    </MagneticLink>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} PrepAI · Crafted for engineers who care
          </p>
        </div>
      </footer>
    </div>
  );
}
