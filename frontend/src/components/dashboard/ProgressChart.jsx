import { useMemo } from 'react';
import { motion } from 'framer-motion';

const colorMap = {
  indigo:  '#818cf8',
  emerald: '#34d399',
  cyan:    '#22d3ee',
  amber:   '#fbbf24',
  rose:    '#fb7185',
  purple:  '#c084fc'
};

export default function ProgressChart({ data = [], color = 'indigo', label }) {
  const { path, points, areaPath, max, min, trend } = useMemo(() => {
    const max = Math.max(100, ...data);
    const min = 0;
    const w = 100, h = 40, pad = 2;
    const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
    const points = data.map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - ((v - min) / (max - min || 1)) * (h - pad * 2);
      return [x, y];
    });
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ');
    const areaPath = path
      ? `${path} L ${points[points.length - 1][0]} ${h - pad} L ${points[0][0]} ${h - pad} Z`
      : '';
    const first = data[0] ?? 0;
    const last = data[data.length - 1] ?? 0;
    const trend = last - first;
    return { path, points, areaPath, max, min, trend };
  }, [data]);

  const stroke = colorMap[color] || colorMap.indigo;
  const trendUp = trend >= 0;
  const gradId = `grad-${color}-${label || 'x'}`;

  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3.5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-white/70">{label}</span>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold">
          <span className="text-white">{data[data.length - 1] ?? 0}</span>
          <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>
            {trendUp ? '↑' : '↓'} {Math.abs(trend)}
          </span>
        </div>
      </div>
      <div className="relative">
        <svg viewBox="0 0 100 40" className="w-full h-16" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.4" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={areaPath}
            fill={`url(#${gradId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          {points.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x} cy={y} r="1.5"
              fill={stroke}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.2 }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}
