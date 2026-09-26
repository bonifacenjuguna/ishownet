'use client';

import { useState } from 'react';
import type { TestResult } from '@/lib/types';
import { formatSpeed, formatMs, type SpeedUnit } from '@/lib/format';
import { ChevronDownIcon } from './icons';

export default function HistoryList({ history, unit }: { history: TestResult[]; unit: SpeedUnit }) {
  const [expanded, setExpanded] = useState(false);
  if (history.length === 0) return null;

  const visible = expanded ? history : history.slice(0, 5);
  const hiddenCount = Math.max(0, history.length - 5);

  return (
    <>
      <div className="history-list">
        {visible.map((r) => (
          <div key={r.id} className="history-row">
            <div className="history-when">
              <strong>{new Date(r.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong>
              <span>{new Date(r.timestamp).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
            </div>
            <div className="history-metric">
              <span className="hm-label">Download</span>
              <span className="hm-value">{formatSpeed(r.downloadMbps, unit)}</span>
            </div>
            <div className="history-metric">
              <span className="hm-label">Upload</span>
              <span className="hm-value">{formatSpeed(r.uploadMbps, unit)}</span>
            </div>
            <div className="history-metric">
              <span className="hm-label">Ping</span>
              <span className="hm-value">{formatMs(r.pingMs)} ms</span>
            </div>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          type="button"
          className="history-more"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
        >
          <span>
            {expanded ? 'Show recent tests' : `Show all ${history.length} tests`}
            {!expanded && <small>{hiddenCount} more below</small>}
          </span>
          <span className={`history-more-icon ${expanded ? 'is-open' : ''}`}>
            <ChevronDownIcon width={16} height={16} />
          </span>
        </button>
      )}
    </>
  );
}