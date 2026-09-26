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

type ActivityMetrics = {
  down: number;
  up: number;
  ping: number;
  jitter: number;
  loss: number;
  downloadLatency?: number;
  uploadLatency?: number;
  bufferbloat?: number;
};

/**
 * Turns measurements into real-life verdicts.
 *
 * Speed is only one part of the decision. Interactive activities are gated by
 * latency/jitter/loss, while streaming is primarily throughput-driven. Loaded
 * latency is used where congestion can visibly affect the experience.
 */
export function buildActivities(r: ActivityMetrics): Activity[] {
  const down = Math.max(0, r.down);
  const up = Math.max(0, r.up);
  const ping = Math.max(0, r.ping);
  const jitter = Math.max(0, r.jitter);
  const loss = Math.max(0, r.loss);
  const downLatency = Math.max(0, r.downloadLatency ?? ping);
  const upLatency = Math.max(0, r.uploadLatency ?? ping);
  const loadedLatency = Math.max(downLatency, upLatency);
  const bufferbloat = Math.max(0, r.bufferbloat ?? Math.max(0, loadedLatency - ping));

  const pick = (great: boolean, ok: boolean): Level => (great ? 'great' : ok ? 'ok' : 'poor');

  return [
    {
      id: 'social',
      name: 'Social & messaging',
      need: 'Emails, chats, posts, reels, stories & DMs',
      level: pick(
        down >= 2 && up >= 0.5 && loss < 1,
        down >= 0.5 && up >= 0.1 && loss < 5
      ),
    },
    {
      id: 'calls',
      name: 'Video calls',
      need: 'Zoom, Meet, Teams in HD',
      level: pick(
        down >= 8 && up >= 4 && ping < 80 && jitter < 20 && loss < 1 && loadedLatency < 120,
        down >= 3 && up >= 1.5 && ping < 180 && jitter < 45 && loss < 3 && loadedLatency < 220
      ),
    },
    {
      id: 'hd',
      name: 'HD streaming',
      need: '1080p on Netflix, YouTube',
      level: pick(
        down >= 10 && loss < 2 && bufferbloat < 120,
        down >= 5 && loss < 5
      ),
    },
    {
      id: '4k',
      name: '4K streaming',
      need: 'Ultra HD, about 15 Mbps',
      level: pick(
        down >= 25 && loss < 2 && bufferbloat < 120,
        down >= 15 && loss < 5
      ),
    },
    {
      id: 'gaming',
      name: 'Online gaming',
      need: 'Low ping and steady jitter',
      level: pick(
        down >= 5 && up >= 2 && ping < 50 && jitter < 15 && loss < 1 && loadedLatency < 100,
        down >= 3 && up >= 1 && ping < 100 && jitter < 35 && loss < 3 && loadedLatency < 180
      ),
    },
    {
      id: 'cloud',
      name: 'Cloud gaming',
      need: 'GeForce NOW, Xbox Cloud',
      level: pick(
        down >= 35 && up >= 5 && ping < 50 && jitter < 15 && loss < 1 && loadedLatency < 100 && bufferbloat < 40,
        down >= 15 && up >= 3 && ping < 90 && jitter < 30 && loss < 3 && loadedLatency < 180 && bufferbloat < 90
      ),
    },
    {
      id: 'live',
      name: 'Live streaming',
      need: 'Going live in 1080p',
      level: pick(
        up >= 10 && upLatency < 120 && loss < 1 && jitter < 20,
        up >= 5 && upLatency < 220 && loss < 3 && jitter < 40
      ),
    },
  ];
}
