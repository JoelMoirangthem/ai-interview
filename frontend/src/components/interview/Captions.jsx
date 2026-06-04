import { motion, AnimatePresence } from 'framer-motion';
import { FiCpu, FiUser } from 'react-icons/fi';

export default function Captions({ speaker, text }) {
  const isAI = speaker === 'ai';
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={text?.slice(0, 40) || 'empty'}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={`
          w-full max-w-2xl mx-auto rounded-2xl border p-4
          ${isAI
            ? 'bg-indigo-500/[0.05] border-indigo-400/15'
            : 'bg-emerald-500/[0.05] border-emerald-400/15'}
        `}
      >
        <div className={`flex items-center gap-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isAI ? 'text-indigo-300' : 'text-emerald-300'}`}>
          {isAI ? <FiCpu className="w-3 h-3" /> : <FiUser className="w-3 h-3" />}
          {isAI ? 'Interviewer' : 'You'}
        </div>
        <p className={`text-sm leading-relaxed ${isAI ? 'text-white/85' : 'text-white/85'}`}>
          {text}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
