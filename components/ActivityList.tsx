import type { ReactNode } from 'react';
import { BroadcastIcon, CloudIcon, GamepadIcon, MessageIcon, TvIcon, VideoIcon } from './icons';
import { levelColor, type Activity } from '@/lib/format';

const ICONS: Record<string, ReactNode> = {
  social: <MessageIcon width={20} height={20} />,
  calls: <VideoIcon width={20} height={20} />,
  hd: <TvIcon width={20} height={20} />,
  '4k': <TvIcon width={20} height={20} />,
  gaming: <GamepadIcon width={20} height={20} />,
  cloud: <CloudIcon width={20} height={20} />,
  live: <BroadcastIcon width={20} height={20} />,
};

const VERDICT = { great: 'Smooth', ok: 'Playable', poor: 'Struggles' } as const;

export default function ActivityList({ activities }: { activities: Activity[] | null }) {
  const items: Activity[] =
    activities ??
    [
      { id: 'social', name: 'Social & messaging', need: 'Chats, posts, reels, stories & DMs' },
      { id: 'calls', name: 'Video calls', need: 'Zoom, Meet, Teams in HD' },
      { id: 'hd', name: 'HD streaming', need: '1080p on Netflix, YouTube' },
      { id: '4k', name: '4K streaming', need: 'Ultra HD, about 25 Mbps' },
      { id: 'gaming', name: 'Online gaming', need: 'Low ping and steady jitter' },
      { id: 'cloud', name: 'Cloud gaming', need: 'GeForce Now, Xbox Cloud' },
      { id: 'live', name: 'Live streaming', need: 'Going live in 1080p' },
    ].map((a) => ({ ...a, level: 'ok' as const }));

  return (
    <div className="activity-grid">
      {items.map((a) => (
        <div key={a.id} className={`card activity ${activities ? '' : 'is-pending'}`}>
          <span className="activity-icon">{ICONS[a.id]}</span>
          <div className="activity-text">
            <strong>{a.name}</strong>
            <span>{a.need}</span>
          </div>
          {activities ? (
            <span className="verdict-pill" style={{ color: levelColor(a.level), background: `color-mix(in srgb, ${levelColor(a.level)} 14%, transparent)` }}>
              {VERDICT[a.level]}
            </span>
          ) : (
            <span className="verdict-pill pending">Run a test</span>
          )}
        </div>
      ))}
    </div>
  );
}
