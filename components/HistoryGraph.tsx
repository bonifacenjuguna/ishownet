'use client';

import type { TestResult } from '@/lib/types';
import { formatSpeed, type SpeedUnit } from '@/lib/format';

interface HistoryGraphProps {
  history: TestResult[];
  unit: SpeedUnit;
}

const W = 640;
const H = 160;
const PAD = 24;

export default function HistoryGraph({ history, unit }: HistoryGraphProps) {
  if (history.length < 2) {
    return (
      <p className="empty">Run a couple more tests to see your trend here.</p>
    );
  }

  const ordered = [...history].reverse(); // oldest first for left-to-right reading
  const maxDown = Math.max(...ordered.map((r) => r.downloadMbps), 1);
  const maxUp = Math.max(...ordered.map((r) => r.uploadMbps), 1);
  const ceiling = Math.max(maxDown, maxUp) * 1.1;

  const stepX = (W - PAD * 2) / (ordered.length - 1);
  const toY = (v: number) => H - PAD - (v / ceiling) * (H - PAD * 2);

  const downPath = ordered
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${PAD + i * stepX} ${toY(r.downloadMbps)}`)
    .join(' ');
  const upPath = ordered
    .map((r, i) => `${i === 0 ? 'M' : 'L'} ${PAD + i * stepX} ${toY(r.uploadMbps)}`)
    .join(' ');

  return (
    <div className="graph">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H}>
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="var(--stroke)" strokeWidth={1} />
        <path d={downPath} fill="none" stroke="var(--gold)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <path d={upPath} fill="none" stroke="var(--cold)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="legend">
        <span className="legend-item">
          <i className="dot dot-down" /> Download · latest {formatSpeed(ordered[ordered.length - 1].downloadMbps, unit)} {unit}
        </span>
        <span className="legend-item">
          <i className="dot dot-up" /> Upload · latest {formatSpeed(ordered[ordered.length - 1].uploadMbps, unit)} {unit}
        </span>
      </div>
      <style jsx>{`
        .graph {
          width: 100%;
        }
        .empty {
          color: var(--text-dim);
          font-size: 0.9rem;
          padding: 24px 0;
        }
        .legend {
          display: flex;
          gap: 20px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .legend-item {
          font-size: 0.8rem;
          color: var(--text-dim);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
        }
        .dot-down {
          background: var(--gold);
        }
        .dot-up {
          background: var(--cold);
        }
      `}</style>
    </div>
  );
}
