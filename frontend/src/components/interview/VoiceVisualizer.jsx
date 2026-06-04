import { motion } from 'framer-motion';
import { FiCpu, FiUser, FiMic, FiVolume2 } from 'react-icons/fi';

const palettes = {
  recording: {
    ring1: 'from-rose-500 via-pink-500 to-rose-400',
    ring2: 'from-orange-500 via-rose-500 to-pink-500',
    ring3: 'from-red-500 via-rose-400 to-orange-400',
    Icon: FiMic,
    iconText: 'text-rose-300'
  },
  speaking: {
    ring1: 'from-indigo-500 via-violet-500 to-purple-500',
    ring2: 'from-cyan-500 via-blue-500 to-indigo-500',
    ring3: 'from-violet-500 via-purple-500 to-fuchsia-500',
    Icon: FiVolume2,
    iconText: 'text-indigo-300'
  },
  idle: {
    ring1: 'from-white/10 via-white/5 to-white/10',
    ring2: 'from-white/[0.06] via-white/[0.03] to-white/[0.06]',
    ring3: 'from-white/[0.04] via-white/[0.02] to-white/[0.04]',
    Icon: FiCpu,
    iconText: 'text-white/30'
  }
};

export default function VoiceVisualizer({ status = 'idle' }) {
  const p = palettes[status] || palettes.idle;
  const isActive = status !== 'idle';

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      {isActive && (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-0 rounded-full bg-gradient-to-tr ${p.ring1} blur-md opacity-60`}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-2 rounded-full bg-gradient-to-br ${p.ring2} blur-lg opacity-70`}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-4 rounded-full bg-gradient-to-tl ${p.ring3} blur-xl opacity-50`}
          />
        </>
      )}

      <div className={`
        relative w-24 h-24 rounded-full flex items-center justify-center
        bg-[#0c0d12] border
        ${isActive ? 'border-white/10' : 'border-white/[0.06]'}
        ${isActive ? 'shadow-[0_0_40px_-8px_rgba(255,255,255,0.1)]' : ''}
        transition-all duration-500
      `}>
        {status === 'recording' ? (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.4, 1.4, 0.6, 1.2, 0.4] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
                className="w-1 h-6 bg-gradient-to-t from-rose-400 to-pink-300 rounded-full"
                style={{ transformOrigin: 'center' }}
              />
            ))}
          </div>
        ) : status === 'speaking' ? (
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.5, 1, 0.7, 1.2, 0.5] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  delay: i * 0.12,
                  ease: 'easeInOut'
                }}
                className="w-1 h-7 bg-gradient-to-t from-indigo-400 to-violet-300 rounded-full"
                style={{ transformOrigin: 'center' }}
              />
            ))}
          </div>
        ) : (
          <p.Icon className={`w-9 h-9 ${p.iconText}`} strokeWidth={1.5} />
        )}
      </div>

      {isActive && (
        <>
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
          <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </>
      )}
    </div>
  );
}
