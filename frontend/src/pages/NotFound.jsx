import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft } from 'react-icons/fi';
import Button from '../components/ui/Button';
import Logo from '../components/Logo';

export default function NotFound() {
  return (
    <div className="relative min-h-screen mesh-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        <div className="glass-strong rounded-3xl p-10">
          <div className="text-7xl font-bold text-gradient mb-2">404</div>
          <h1 className="text-xl font-bold text-white mb-2">Page not found</h1>
          <p className="text-sm text-white/50 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/">
              <Button icon={FiHome}>Home</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" icon={FiArrowLeft}>Dashboard</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}