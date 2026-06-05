import { Component } from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome, FiRefreshCw } from 'react-icons/fi';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen mesh-bg flex items-center justify-center px-4">
          <div className="glass-strong rounded-3xl p-10 text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="w-7 h-7 text-rose-300" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-white/50 mb-6">
              {this.props.fallbackMessage || 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => window.location.reload()} icon={FiRefreshCw}>
                Reload
              </Button>
              <Link to="/dashboard">
                <Button variant="secondary" icon={FiHome}>
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}