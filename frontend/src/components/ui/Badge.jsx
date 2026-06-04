const variants = {
  default: 'bg-white/[0.04] text-white/80 border border-white/[0.06]',
  success: 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20',
  warning: 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
  danger:  'bg-rose-500/10 text-rose-300 border border-rose-400/20',
  info:    'bg-indigo-500/10 text-indigo-300 border border-indigo-400/20',
  purple:  'bg-purple-500/10 text-purple-300 border border-purple-400/20',
  cyan:    'bg-cyan-500/10 text-cyan-300 border border-cyan-400/20',
  pink:    'bg-pink-500/10 text-pink-300 border border-pink-400/20'
};

const sizes = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2'
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  className = ''
}) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full
        whitespace-nowrap
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
    >
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      {children}
    </span>
  );
}
