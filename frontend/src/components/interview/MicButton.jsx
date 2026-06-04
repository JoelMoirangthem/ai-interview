import { motion } from 'framer-motion';
import { FiMic, FiMicOff, FiVolume2, FiSquare } from 'react-icons/fi';

export default function MicButton({ micOn, aiSpeaking, disabled, onToggle }) {
  const state = micOn ? 'recording' : aiSpeaking ? 'speaking' : 'idle';

  const stateMeta = {
    recording: {
      ring: 'from-rose-500 via-pink-500 to-rose-500',
      glow: 'shadow-[0_0_48px_-4px_rgba(244,63,94,0.6)]',
      innerBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
      Icon: FiSquare,
      label: 'Tap to stop'
    },
    speaking: {
      ring: 'from-indigo-500 via-violet-500 to-purple-500',
      glow: 'shadow-[0_0_48px_-4px_rgba(99,102,241,0.6)]',
      innerBg: 'bg-gradient-to-br from-indigo-500 to-purple-500',
      Icon: FiVolume2,
      label: 'Tap to interrupt'
    },
    idle: {
      ring: 'from-white/20 via-white/10 to-white/20',
      glow: 'shadow-[0_0_24px_-8px_rgba(255,255,255,0.2)]',
      innerBg: 'bg-white/[0.06] border border-white/[0.08]',
      Icon: FiMic,
      label: 'Tap to speak'
    }
  };

  const meta = stateMeta[state];

  return (
    <div className="relative flex flex-col items-center gap-2">
      {state === 'recording' && (
        <>
          <span className="absolute inset-0 m-auto w-20 h-20 rounded-full border-2 border-rose-400/40 animate-ripple" />
          <span className="absolute inset-0 m-auto w-20 h-20 rounded-full border-2 border-rose-400/30 animate-ripple" style={{ animationDelay: '0.6s' }} />
        </>
      )}

      <motion.button
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        onClick={onToggle}
        disabled={disabled}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center
          bg-gradient-to-br ${meta.ring} p-[2px]
          ${meta.glow}
          transition-shadow duration-300
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <div className={`
          w-full h-full rounded-full flex items-center justify-center
          ${meta.innerBg}
          ${state === 'idle' ? 'hover:bg-white/[0.08] transition-colors' : ''}
        `}>
          <meta.Icon className={`w-7 h-7 ${state === 'idle' ? 'text-white/70' : 'text-white'}`} strokeWidth={state === 'idle' ? 1.8 : 2.2} />
        </div>

        {state === 'recording' && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
        )}
      </motion.button>

      <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
        {meta.label}
      </p>
    </div>
  );
}
