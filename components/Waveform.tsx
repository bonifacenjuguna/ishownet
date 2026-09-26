'use client';

interface WaveformProps {
  points: number[]; // recent mbps samples, oldest first
  tone?: 'download' | 'upload';
}

const BAR_COUNT = 48;

export default function Waveform({ points, tone = 'download' }: WaveformProps) {
  const recent = points.slice(-BAR_COUNT);
  const padded = Array(Math.max(0, BAR_COUNT - recent.length)).fill(0).concat(recent);
  const ceiling = Math.max(...recent, 1) * 1.15;

  return (
    <div className={`waveform ${tone}`} aria-hidden="true">
      {padded.map((v: number, i: number) => (
        <div key={i} className="wf-bar" style={{ height: `${Math.max(4, (v / ceiling) * 100)}%` }} />
      ))}
    </div>
  );
}
