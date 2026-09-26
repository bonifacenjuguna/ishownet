import type { TestResult } from '@/lib/types';
import { formatSpeed, formatMs, type SpeedUnit } from '@/lib/format';

export default function HistoryList({ history, unit }: { history: TestResult[]; unit: SpeedUnit }) {
  if (history.length === 0) return null;
  return (
    <div className="history-list">
      {history.slice(0, 6).map((r) => (
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
  );
}
