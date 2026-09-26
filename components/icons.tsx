import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function PulseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12h4l2.5-7 4 14 2.5-7H22" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v13" />
      <path d="M6.5 11.5 12 17l5.5-5.5" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21V8" />
      <path d="M6.5 12.5 12 7l5.5 5.5" />
      <path d="M4 3h16" />
    </svg>
  );
}

export function JitterIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12h3l2-6 3 12 2-9 2 6 3-9h3" />
    </svg>
  );
}

export function BufferIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="9" width="4" height="8" rx="1" />
      <rect x="10" y="5" width="4" height="12" rx="1" />
      <rect x="17" y="12" width="4" height="5" rx="1" />
    </svg>
  );
}

export function PacketLossIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="10" width="5" height="5" rx="1" />
      <rect x="16" y="10" width="5" height="5" rx="1" />
      <path d="M8 12.5h2" strokeDasharray="2 2" />
      <path d="M14 12.5h2" strokeDasharray="2 2" />
      <path d="M11 12.5v0" />
    </svg>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 2.5 4.2 5.7 4.2 9s-1.4 6.5-4.2 9c-2.8-2.5-4.2-5.7-4.2-9S9.2 5.5 12 3Z" />
    </svg>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

export function WifiIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 8.5a16 16 0 0 1 20 0" />
      <path d="M5.5 12.5a11 11 0 0 1 13 0" />
      <path d="M9 16.3a5.5 5.5 0 0 1 6 0" />
      <circle cx="12" cy="19.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function EthernetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="7" y="3" width="10" height="8" rx="1" />
      <path d="M9 11v3M15 11v3" />
      <rect x="6" y="14" width="12" height="7" rx="1" />
      <path d="M9 21v-2M12 21v-2M15 21v-2" />
    </svg>
  );
}

export function CellularIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V16" />
      <path d="M9.5 20v-8" />
      <path d="M15 20V8" />
      <path d="M20.5 20V4" />
    </svg>
  );
}

export function HistoryIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v4h4" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="M8 10.8 16 7M8 13.2l8 4" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M5 15V5.5A1.5 1.5 0 0 1 6.5 4H15" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5v15l14-7.5-14-7.5Z" />
    </svg>
  );
}

export function SwapIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8h13l-3-3" />
      <path d="M20 16H7l3 3" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16" />
      <path d="M9 7V4.5h6V7" />
      <path d="M6 7l1 13h10l1-13" />
    </svg>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-8l-5 3v-3.1a2 2 0 0 1-1-1.9v-7a2 2 0 0 1 2-2Z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6" width="12.5" height="12" rx="2.5" />
      <path d="m15.5 10.5 5-3v9l-5-3" />
    </svg>
  );
}

export function TvIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="4.5" width="18" height="12.5" rx="2.5" />
      <path d="M8 20.5h8" />
      <path d="M12 17v3.5" />
    </svg>
  );
}

export function GamepadIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 7.5h10a4.5 4.5 0 0 1 4.4 5.4l-.7 3.4a2.4 2.4 0 0 1-4.2 1L15 15.5H9l-1.5 1.8a2.4 2.4 0 0 1-4.2-1l-.7-3.4A4.5 4.5 0 0 1 7 7.5Z" />
      <path d="M8 10.5v3M6.5 12h3" />
      <circle cx="15.5" cy="11" r=".6" />
      <circle cx="17.5" cy="13" r=".6" />
    </svg>
  );
}

export function CloudIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 10.5a4 4 0 0 1-.5 8H7Z" />
    </svg>
  );
}

export function BroadcastIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="2" />
      <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
      <path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.7A9.8 9.8 0 0 1 12 5.5c6.4 0 10 6.5 10 6.5a17 17 0 0 1-3.2 3.9M6.2 6.9A17 17 0 0 0 2 12s3.6 6.5 10 6.5c1.5 0 2.8-.3 4-.9" />
      <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
    </svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 11a8 8 0 0 0-14.5-4M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.5 4M20 20v-4h-4" />
    </svg>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <ellipse cx="12" cy="5.5" rx="8" ry="2.8" />
      <path d="M4 5.5v13c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8v-13" />
      <path d="M4 12c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8" />
    </svg>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4" />
      <path d="M12 19.1v2.4" />
      <path d="M4.6 4.6l1.7 1.7" />
      <path d="M17.7 17.7l1.7 1.7" />
      <path d="M2.5 12h2.4" />
      <path d="M19.1 12h2.4" />
      <path d="M4.6 19.4l1.7-1.7" />
      <path d="M17.7 6.3l1.7-1.7" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z" />
    </svg>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z" />
    </svg>
  );
}
