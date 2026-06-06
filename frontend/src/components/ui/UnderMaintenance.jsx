import { motion } from 'framer-motion';
import { FiCloudOff, FiRefreshCw, FiWifi } from 'react-icons/fi';
import Button from './Button';

export default function UnderMaintenance({ type = 'ai' }) {
  const isBackend = type === 'backend';

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative glass-strong rounded-3xl p-10 sm:p-14 text-center max-w-lg w-full"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={`w-20 h-20 rounded-[2rem] mx-auto mb-6 flex items-center justify-center ${
            isBackend
              ? 'bg-rose-500/10 border border-rose-400/20'
              : 'bg-amber-500/10 border border-amber-400/20'
          }`}
        >
          {isBackend ? (
            <FiWifi className="w-9 h-9 text-rose-300" />
          ) : (
            <FiCloudOff className="w-9 h-9 text-amber-300" />
          )}
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
          {isBackend ? 'Server Unreachable' : 'Service Under Maintenance'}
        </h1>

        <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-8 max-w-sm mx-auto">
          {isBackend
            ? 'Our servers are currently not responding. This might be due to a network issue or scheduled maintenance. Please try again shortly.'
            : 'Our AI interview service is temporarily unavailable. We are working on resolving this as quickly as possible. Please check back soon.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" icon={FiRefreshCw} onClick={handleRetry}>
            Try Again
          </Button>
        </div>

        <p className="text-xs text-white/30 mt-8">
          If the issue persists, please contact support.
        </p>
      </motion.div>
    </div>
  );
}
