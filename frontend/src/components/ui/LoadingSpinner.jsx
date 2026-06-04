const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-[3px]',
  xl: 'h-16 w-16 border-4'
};

export default function LoadingSpinner({ size = 'md', className = '', text }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-white/10`} />
        <div className={`absolute inset-0 ${sizes[size]} rounded-full border-transparent border-t-indigo-400 border-r-purple-400 animate-spin`} />
      </div>
      {text && <p className="text-sm text-white/50">{text}</p>}
    </div>
  );
}
