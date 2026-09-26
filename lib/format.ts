export type SpeedUnit = 'Mbps' | 'MB/s';

export function formatSpeed(mbps: number, unit: SpeedUnit, decimals = 1): string {
  const value = unit === 'MB/s' ? mbps / 8 : mbps;
  return value.toFixed(decimals);
}

export function formatMs(ms: number, decimals = 0): string {
  return ms.toFixed(decimals);
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`;
  return `${(bytes / 1e6).toFixed(0)} MB`;
}

/** "7 min 12 s" style duration for a transfer of `megabits` at `mbps`. */
export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  if (seconds < 60) return `${Math.ceil(seconds)} sec`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s ? `${m} min ${s} s` : `${m} min`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

export type Level = 'great' | 'ok' | 'poor';

export function levelColor(level: Level): string {
  return level === 'great' ? 'var(--good)' : level === 'ok' ? 'var(--warn)' : 'var(--bad)';
}

export function levelLabel(level: Level): string {
  return level === 'great' ? 'Excellent' : level === 'ok' ? 'Okay' : 'Poor';
}

export function gradeLevel(grade: 'A' | 'B' | 'C' | 'D' | 'F'): Level {
  return grade === 'A' || grade === 'B' ? 'great' : grade === 'C' ? 'ok' : 'poor';
}

export function speedVerdict(mbps: number): { title: string; tone: Level } {
  if (mbps < 5) return { title: 'Slow', tone: 'poor' };
  if (mbps < 25) return { title: 'Decent', tone: 'ok' };
  if (mbps < 100) return { title: 'Fast', tone: 'great' };
  if (mbps < 300) return { title: 'Very fast', tone: 'great' };
  return { title: 'Blazing', tone: 'great' };
}

export interface Activity {
  id: string;
  name: string;
  need: string;
  level: Level;
}

/** Turns raw numbers into "what can I actually do with this?" verdicts. */
export function buildActivities(r: { down: number; up: number; ping: number; jitter: number; loss: number }): Activity[] {
  const { down, up, ping, jitter, loss } = r;
  const pick = (great: boolean, ok: boolean): Level => (great ? 'great' : ok ? 'ok' : 'poor');
  return [
    {
      id: 'calls',
      name: 'Video calls',
      need: 'Zoom, Meet, Teams in HD',
      level: pick(down >= 8 && up >= 4 && ping < 100 && loss < 1, down >= 3 && up >= 1.5 && ping < 200),
    },
    {
      id: 'hd',
      name: 'HD streaming',
      need: '1080p on Netflix, YouTube',
      level: pick(down >= 15, down >= 5),
    },
    {
      id: '4k',
      name: '4K streaming',
      need: 'Ultra HD, about 25 Mbps',
      level: pick(down >= 40, down >= 25),
    },
    {
      id: 'gaming',
      name: 'Online gaming',
      need: 'Low ping and steady jitter',
      level: pick(ping < 40 && jitter < 15 && loss < 1, ping < 80 && jitter < 30 && loss < 3),
    },
    {
      id: 'cloud',
      name: 'Cloud gaming',
      need: 'GeForce Now, Xbox Cloud',
      level: pick(down >= 35 && ping < 40 && jitter < 15, down >= 15 && ping < 80),
    },
    {
      id: 'live',
      name: 'Live streaming',
      need: 'Going live in 1080p',
      level: pick(up >= 10, up >= 5),
    },
  ];
}
