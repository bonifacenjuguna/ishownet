import type { ReactNode } from 'react';
import { levelColor, levelLabel, type Level } from '@/lib/format';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | null;
  unit?: string;
  hint: string;
  level?: Level;
  badge?: string;
  action?: ReactNode;
  blurred?: boolean;
}

export default function StatCard({ icon, label, value, unit, hint, level, badge, action, blurred }: StatCardProps) {
  const tint = level ? levelColor(level) : 'var(--brand)';

  return (
    <article className="card stat">
      <div className="stat-head">
        <span
          className="stat-icon"
          style={{
            color: tint,
            background: `color-mix(in srgb, ${tint} 14%, transparent)`,
          }}
        >
          {icon}
        </span>
        <span className="stat-label">{label}</span>
        {level && value !== null && (
          <span
            className="pill"
            style={{
              color: levelColor(level),
              borderColor: `color-mix(in srgb, ${levelColor(level)} 40%, transparent)`,
            }}
          >
            {badge ?? levelLabel(level)}
          </span>
        )}
        {action && <span className="stat-action">{action}</span>}
      </div>

      <div className="stat-body">
        <span className={`stat-value ${blurred ? 'is-blurred' : ''}`}>
          {value === null ? '—' : value}
          {value !== null && unit && <span className="stat-unit">{unit}</span>}
        </span>
      </div>

      <p className="stat-hint">{hint}</p>
    </article>
  );
}
