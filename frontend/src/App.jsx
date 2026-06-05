import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom from './pages/InterviewRoom';
import Results from './pages/Results';
import History from './pages/History';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-[#06070b] text-white selection:bg-indigo-500/30">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/interview/setup" element={<ProtectedRoute><ErrorBoundary><InterviewSetup /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/interview/:id" element={<ProtectedRoute><ErrorBoundary><InterviewRoom /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><ErrorBoundary><Results /></ErrorBoundary></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><ErrorBoundary><History /></ErrorBoundary></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}