import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { FiZap, FiAlertCircle, FiShield } from 'react-icons/fi';

export default function Auth() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await googleLogin({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        photoURL: user.photoURL
      });
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return;
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for Google sign-in.');
        return;
      }
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen mesh-bg flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>

        <div className="glass-strong rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-semibold tracking-wider text-indigo-300 uppercase mb-3">
              <FiZap className="w-3 h-3" /> Fastest way in
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Continue with Google</h1>
            <p className="text-sm text-white/50 mt-1.5">One click. No passwords to remember.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-400/20 text-rose-200 text-sm rounded-xl px-3.5 py-3 mb-5"
            >
              <FiAlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 h-12 px-4 rounded-xl bg-white text-[#1f1f1f] text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50 mb-4"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-400/10 text-xs text-white/60">
            <FiShield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>We never see your Google password. Sign-in uses secure OAuth.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
