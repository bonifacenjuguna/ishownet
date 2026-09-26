import type { ReactNode } from 'react';
import { levelColor, levelLabel, type Level } from '@/lib/format';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | null; // null = not measured yet
  unit?: string;
  hint: string;
  level?: Level;
  badge?: string;
  series?: number[];
  size?: 'lg' | 'md';
  live?: boolean;
  color?: string;
  action?: ReactNode;
  blurred?: boolean; // mask the value with a blur instead of showing it plainly
}

function Sparkline({ series, color }: { series: number[]; color: string }) {
  if (series.length < 2) return <div className="spark spark-empty" />;
  // Down-sample to ~40 points so long tests stay light.
  const step = Math.max(1, Math.floor(series.length / 40));
  const pts = series.filter((_, i) => i % step === 0);
  const max = Math.max(...pts, 1);
  const W = 100;
  const H = 32;
  const d = pts
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${((i / (pts.length - 1)) * W).toFixed(2)} ${(H - 2 - (v / max) * (H - 4)).toFixed(2)}`)
    .join(' ');
  return (
    <svg className="spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L ${W} ${H} L 0 ${H} Z`} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function StatCard({ icon, label, value, unit, hint, level, badge, series, size = 'md', live, color, action, blurred }: StatCardProps) {
  const tint = color ?? (level ? levelColor(level) : 'var(--brand)');
  return (
    <article className={`card stat stat-${size} ${live ? 'is-live' : ''}`}>
      <div className="stat-head">
        <span className="stat-icon" style={{ color: tint, background: `color-mix(in srgb, ${tint} 14%, transparent)` }}>
          {icon}
        </span>
        <span className="stat-label">{label}</span>
        {level && value !== null && (
          <span className="pill" style={{ color: levelColor(level), borderColor: `color-mix(in srgb, ${levelColor(level)} 40%, transparent)` }}>
            {badge ?? levelLabel(level)}
          </span>
        )}
        {action && <span className="stat-action">{action}</span>}
      </div>

      <div className="stat-body">
        {value === null ? (
          <span className="stat-value stat-empty">—</span>
        ) : (
          <span className={`stat-value ${blurred ? 'is-blurred' : ''}`}>
            {value}
            {unit && <span className="stat-unit">{unit}</span>}
          </span>
        )}
      </div>

      {series && <Sparkline series={series} color={tint} />}
      <p className="stat-hint">{hint}</p>
    </article>
  );
}
