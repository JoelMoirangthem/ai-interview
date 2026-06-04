import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  gradient = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hover ? { y: -4, transition: { duration: 0.25 } } : {}}
      className={`
        relative overflow-hidden
        ${gradient ? 'glass-strong gradient-border' : 'glass'}
        rounded-2xl ${padding}
        ${hover ? 'glass-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}
