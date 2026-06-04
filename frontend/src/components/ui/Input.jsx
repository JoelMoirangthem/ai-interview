import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-medium text-white/70 mb-1.5 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full h-11
            ${Icon ? 'pl-10' : 'pl-4'} pr-4
            bg-white/[0.03] hover:bg-white/[0.05]
            border border-white/[0.08]
            rounded-xl
            text-white placeholder-white/30
            text-sm
            transition-all duration-200
            focus:outline-none
            focus:border-indigo-400/40
            focus:bg-white/[0.05]
            focus:shadow-[0_0_0_4px_rgba(99,102,241,0.08)]
            ${error ? 'border-rose-400/50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-rose-300/90">{error}</p>
      )}
    </div>
  );
});

export default Input;
