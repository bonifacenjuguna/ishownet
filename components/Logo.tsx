export default function Logo({ size = 30 }: { size?: number }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className="logo-mark">
        <defs>
          <linearGradient id="logoGrad" x1="2" y1="26" x2="27" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#e3b34d" />
            <stop offset="1" stopColor="#e8432c" />
          </linearGradient>
          <clipPath id="logoClip">
            <rect x="1.4" y="1.4" width="29.2" height="29.2" rx="9" />
          </clipPath>
          <filter id="logoGlow" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect x="1.4" y="1.4" width="29.2" height="29.2" rx="9" fill="#131317" stroke="#26262f" strokeWidth="1.2" />
        <g clipPath="url(#logoClip)">
          <circle className="logo-ring logo-ring-1" cx="23.5" cy="16" r="2" fill="none" stroke="url(#logoGrad)" />
          <circle className="logo-ring logo-ring-2" cx="23.5" cy="16" r="2" fill="none" stroke="url(#logoGrad)" />
          <circle className="logo-ring logo-ring-3" cx="23.5" cy="16" r="2" fill="none" stroke="url(#logoGrad)" />
          <circle className="logo-ring logo-ring-4" cx="23.5" cy="16" r="2" fill="none" stroke="url(#logoGrad)" />
          <circle className="logo-ring logo-ring-5" cx="23.5" cy="16" r="2" fill="none" stroke="url(#logoGrad)" />
          <path className="logo-pulse" d="M4 16 L7 16 L9 8 L11 24 L13 12 L15 20 L17 14 L19 16 L23.5 16" fill="none" stroke="url(#logoGrad)" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" filter="url(#logoGlow)" />
          <circle className="logo-dot" cx="23.5" cy="16" r="1.9" fill="url(#logoGrad)" filter="url(#logoGlow)" />
        </g>
      </svg>
      <span className="logo-word">
        iShow<span>Net</span>
      </span>
    </span>
  );
}