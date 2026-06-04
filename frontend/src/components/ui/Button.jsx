import { motion } from 'framer-motion';

const variants = {
  primary: `
    relative overflow-hidden text-white font-medium
    bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500
    shadow-[0_8px_24px_-6px_rgba(99,102,241,0.5)]
    hover:shadow-[0_12px_32px_-6px_rgba(99,102,241,0.65)]
    border border-white/10
  `,
  secondary: `
    text-white/90 font-medium
    bg-white/[0.04] hover:bg-white/[0.08]
    border border-white/[0.08] hover:border-white/[0.16]
    backdrop-blur-xl
  `,
  ghost: `
    text-white/80 hover:text-white font-medium
    bg-transparent hover:bg-white/[0.05]
    border border-transparent
  `,
  danger: `
    text-white font-medium
    bg-gradient-to-r from-rose-500 to-pink-500
    shadow-[0_8px_24px_-6px_rgba(244,63,94,0.5)]
    hover:shadow-[0_12px_32px_-6px_rgba(244,63,94,0.65)]
    border border-white/10
  `,
  success: `
    text-white font-medium
    bg-gradient-to-r from-emerald-500 to-teal-500
    shadow-[0_8px_24px_-6px_rgba(16,185,129,0.5)]
    border border-white/10
  `
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-lg',
  sm: 'h-9 px-3.5 text-sm gap-2 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
  xl: 'h-14 px-8 text-base gap-3 rounded-2xl'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -1 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        group relative inline-flex items-center justify-center
        transition-all duration-200 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {variant === 'primary' && !isDisabled && (
        <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      )}
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
          <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={2.2} />
      ) : null}
      {children && <span className="relative whitespace-nowrap">{children}</span>}
      {IconRight && !loading && <IconRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />}
    </motion.button>
  );
}
