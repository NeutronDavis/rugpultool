export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 128 128" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="rp-red" x1="18" y1="86" x2="64" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8f0000" />
          <stop offset="0.55" stopColor="#e10600" />
          <stop offset="1" stopColor="#ff4a4a" />
        </linearGradient>
        <linearGradient id="rp-dark" x1="64" y1="44" x2="114" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor="#26262b" />
          <stop offset="1" stopColor="#08080a" />
        </linearGradient>
        <clipPath id="rp-cap">
          <rect x="14" y="44" width="100" height="40" rx="20" />
        </clipPath>
      </defs>
      <g transform="rotate(-45 64 64)">
        <g clipPath="url(#rp-cap)">
          <rect x="14" y="44" width="50" height="40" fill="url(#rp-red)" />
          <rect x="64" y="44" width="50" height="40" fill="url(#rp-dark)" />
        </g>
        <rect
          x="14"
          y="44"
          width="100"
          height="40"
          rx="20"
          fill="none"
          stroke="#3a3a40"
          strokeWidth="2.5"
        />
        <path
          d="M33 56c-4.6 3.6-6 9.6-3.4 14"
          stroke="#fff"
          strokeOpacity="0.85"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function Logo({
  className = "",
  subdued = false,
}: {
  className?: string;
  subdued?: boolean;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-8 w-8 shrink-0" />
      <span className="text-[17px] font-semibold tracking-tight leading-none">
        <span className="text-base-content">rugpull</span>
        <span className={subdued ? "text-base-content/50" : "text-primary"}>tool</span>
      </span>
    </span>
  );
}
