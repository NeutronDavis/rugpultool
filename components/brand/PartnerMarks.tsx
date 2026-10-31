import Image from "next/image";

export function SolanaMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 20" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="sol-grad" x1="0" y1="0" x2="24" y2="20" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9945FF" />
          <stop offset="1" stopColor="#14F195" />
        </linearGradient>
      </defs>
      <path d="M4.2 13.9a.8.8 0 0 1 .57-.24h15.1c.36 0 .54.43.28.68l-2.98 2.98a.8.8 0 0 1-.57.24H1.5a.4.4 0 0 1-.28-.68z" fill="url(#sol-grad)" opacity="0.85" />
      <path d="M4.2 3.28a.8.8 0 0 1 .57-.24h15.1c.36 0 .54.43.28.68l-2.98 2.98a.8.8 0 0 1-.57.24H1.5a.4.4 0 0 1-.28-.68z" fill="url(#sol-grad)" />
      <path d="M19.8 8.56a.8.8 0 0 0-.57-.24H4.13c-.36 0-.54.43-.28.68l2.98 2.98a.8.8 0 0 0 .57.24h15.1c.36 0 .54-.43.28-.68z" fill="url(#sol-grad)" opacity="0.7" />
    </svg>
  );
}

export interface Venue {
  name: string;
  logo: string;
}

/**
 * Official marks, stored locally in /public/partners so the strip never depends
 * on a third-party CDN staying up. All seven are transparent PNGs — no chip or
 * plate behind them — so they sit directly on the page background.
 */
export const VENUES: Venue[] = [
  { name: "Solana", logo: "/partners/solana.png" },
  { name: "pump.fun", logo: "/partners/pumpfun.png" },
  { name: "bonk.fun", logo: "/partners/bonkfun.png" },
  { name: "Raydium", logo: "/partners/raydium.png" },
  { name: "Jupiter", logo: "/partners/jupiter.png" },
  { name: "Meteora", logo: "/partners/meteora.png" },
  { name: "Orca", logo: "/partners/orca.png" },
];

export function VenueBadge({ venue, size = "h-7 w-7" }: { venue: Venue; size?: string }) {
  return (
    <span className={`${size} grid shrink-0 place-items-center`} title={venue.name}>
      <Image
        src={venue.logo}
        alt={venue.name}
        width={64}
        height={64}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export function PartnerStrip({ labels = false }: { labels?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5 sm:gap-x-5 sm:gap-y-3">
      {VENUES.map((venue) => (
        <span key={venue.name} className="flex items-center gap-1.5 sm:gap-2">
          <VenueBadge venue={venue} size="h-6 w-6 sm:h-7 sm:w-7" />
          {labels && (
            <span className="text-[11px] sm:text-xs text-base-content/60 font-medium">{venue.name}</span>
          )}
        </span>
      ))}
    </div>
  );
}
