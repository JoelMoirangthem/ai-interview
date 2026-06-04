import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const iconMap = {
  'Frontend Developer':       { icon: '🎨', color: 'from-pink-500/20 to-rose-500/20',     border: 'border-pink-400/20',     text: 'text-pink-300' },
  'Backend Developer':        { icon: '⚙️', color: 'from-indigo-500/20 to-blue-500/20',   border: 'border-indigo-400/20',   text: 'text-indigo-300' },
  'MERN Stack Developer':     { icon: '🔄', color: 'from-emerald-500/20 to-teal-500/20',  border: 'border-emerald-400/20',  text: 'text-emerald-300' },
  'Full Stack Developer':     { icon: '🚀', color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-400/20',   text: 'text-violet-300' },
  'Java Developer':           { icon: '☕', color: 'from-orange-500/20 to-amber-500/20',  border: 'border-orange-400/20',   text: 'text-orange-300' },
  'Python Developer':         { icon: '🐍', color: 'from-cyan-500/20 to-blue-500/20',    border: 'border-cyan-400/20',     text: 'text-cyan-300' },
  'Data Structures & Algorithms': { icon: '🧮', color: 'from-purple-500/20 to-fuchsia-500/20', border: 'border-purple-400/20', text: 'text-purple-300' },
  'HR Interview':             { icon: '🤝', color: 'from-rose-500/20 to-pink-500/20',    border: 'border-rose-400/20',     text: 'text-rose-300' },
  'System Design':            { icon: '🏗️', color: 'from-amber-500/20 to-yellow-500/20', border: 'border-amber-400/20',    text: 'text-amber-300' },
  'Custom Interview':         { icon: '✨', color: 'from-fuchsia-500/20 to-pink-500/20', border: 'border-fuchsia-400/20',  text: 'text-fuchsia-300' }
};

export default function ModeSelector({ modes, selected, onSelect }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {modes.map((mode, i) => {
        const meta = iconMap[mode] || { icon: '💼', color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-400/20', text: 'text-indigo-300' };
        const isSelected = selected === mode;
        return (
          <motion.button
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(mode)}
            type="button"
            className={`
              group relative text-left p-4 rounded-2xl border transition-all overflow-hidden
              ${isSelected
                ? `bg-gradient-to-br ${meta.color} ${meta.border} shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]`
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.12]'}
            `}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
              >
                <FiCheck className="w-3 h-3 text-indigo-600" strokeWidth={3} />
              </motion.div>
            )}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} border ${meta.border} flex items-center justify-center text-lg mb-3`}>
              {meta.icon}
            </div>
            <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
              {mode}
            </p>
            {isSelected && (
              <p className={`text-[10px] mt-1 font-medium uppercase tracking-wider ${meta.text}`}>
                Selected
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
