/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      colors: {
        surface: {
          DEFAULT: '#0c0d12',
          2: '#11131a',
          3: '#181a23'
        },
        ink: {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
          dim: '#64748b'
        },
        brand: {
          indigo: '#6366f1',
          purple: '#a855f7',
          pink: '#ec4899',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        'glow-indigo': '0 0 40px -8px rgba(99,102,241,0.4)',
        'glow-purple': '0 0 40px -8px rgba(168,85,247,0.4)',
        'inner-soft': 'inset 0 1px 0 0 rgba(255,255,255,0.05)'
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        breathe: 'breathe 4s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'spin-slower': 'spin 16s linear infinite',
        shimmer: 'shimmer 2s linear infinite',
        blink: 'blink 1s ease-in-out infinite',
        ripple: 'ripple 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px -4px rgba(99,102,241,0.4)' },
          '50%': { boxShadow: '0 0 32px -4px rgba(99,102,241,0.7)' }
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' }
        }
      }
    }
  },
  plugins: []
};
