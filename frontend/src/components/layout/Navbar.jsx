import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiLayout, FiClock, FiUser, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: FiLayout },
  { to: '/interview/setup', label: 'New Interview', icon: FiZap },
  { to: '/history', label: 'History', icon: FiClock }
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || 'U';

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${scrolled
          ? 'bg-[#06070b]/80 backdrop-blur-2xl border-b border-white/[0.06]'
          : 'bg-transparent border-b border-transparent'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center">
          <Logo size="sm" />
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.05] rounded-2xl p-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to ||
                (link.to === '/dashboard' && location.pathname.startsWith('/dashboard'));
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    relative flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-xl transition-colors
                    ${isActive ? 'text-white' : 'text-white/50 hover:text-white/80'}
                  `}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] border border-white/[0.08] rounded-xl"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="w-3.5 h-3.5 relative z-10" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          {user ? (
            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                  {user.avatar
                    ? <img src={user.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} />
                    : userInitial}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-white/80 max-w-[120px] truncate">{user.name}</span>
                <FiChevronDown className={`w-3.5 h-3.5 text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl p-1.5 shadow-2xl"
                  >
                    <div className="px-3 py-2.5 border-b border-white/[0.05] mb-1">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-300 hover:bg-rose-500/10 transition-colors"
                    >
                      <FiLogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-[0_4px_12px_-2px_rgba(99,102,241,0.5)] hover:shadow-[0_8px_20px_-4px_rgba(99,102,241,0.65)] transition-shadow"
            >
              Sign in
              <FiZap className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

    </motion.nav>
  );
}
