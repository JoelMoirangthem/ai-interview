import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { box: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    md: { box: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-base' },
    lg: { box: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-lg' }
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 400 }}
        className={`
          relative ${s.box} rounded-xl
          bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500
          flex items-center justify-center
          shadow-[0_8px_20px_-6px_rgba(99,102,241,0.6)]
          overflow-hidden
        `}
      >
        <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
        <FiZap className={`${s.icon} text-white relative z-10`} strokeWidth={2.5} />
      </motion.div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`${s.text} font-bold text-white tracking-tight`}>
            Prep<span className="text-gradient">AI</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-white/40 font-medium tracking-wider uppercase mt-0.5">
              Interview Coach
            </span>
          )}
        </div>
      )}
    </div>
  );
}
