import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { PartnerStrip, SolanaMark } from "@/components/brand/PartnerMarks";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "/launch", label: "Launch studio" },
      { href: "/portfolio", label: "Positions" },
      { href: "/dashboard", label: "Risk radar" },
      { href: "/#pricing", label: "Pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "Methodology" },
      { href: "/#how", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
      { href: "/#coverage", label: "Coverage" },
    ],
  },
  {
    title: "Data",
    links: [
      { href: "https://dexscreener.com", label: "DexScreener", external: true },
      { href: "https://rugcheck.xyz", label: "RugCheck", external: true },
      { href: "https://www.geckoterminal.com", label: "GeckoTerminal", external: true },
      { href: "https://solscan.io", label: "Solscan", external: true },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/about", label: "Disclaimer" },
      { href: "/about", label: "Risk notice" },
      { href: "/about", label: "Terms" },
      { href: "/about", label: "Privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-base-300 bg-base-200/40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[1.2fr_2.8fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-base-content/45">
              Launch Solana memecoins on a bonding curve where the liquidity reserve is owned by
              the program. No LP token, no withdraw function, no exit for the creator.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="badge badge-outline badge-sm gap-1.5 border-base-300 text-base-content/60">
                <SolanaMark className="h-3 w-3" />
                Solana mainnet
              </span>
              <span className="badge badge-ghost badge-sm text-base-content/40">v1.0</span>
            </div>
          </div>

          <div className="footer sm:footer-horizontal grid-cols-2 gap-6 sm:gap-8 md:grid-cols-4">
            {COLUMNS.map((column) => (
              <nav key={column.title}>
                <h6 className="footer-title text-[11px] uppercase tracking-[0.14em] text-base-content/40">
                  {column.title}
                </h6>
                {column.links.map((link) =>
                  "external" in link && link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-hover text-[13px] text-base-content/55"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="link link-hover text-[13px] text-base-content/55"
                    >
                      {link.label}
                    </Link>
                  )
                )}
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-base-300 pt-7">
          <p className="text-[10px] uppercase tracking-[0.18em] text-base-content/30">
            Exchange partners
          </p>
          <div className="mt-4">
            <PartnerStrip labels />
          </div>
        </div>

        <div className="mt-8 border-t border-base-300 pt-6">
          <p className="text-[11px] leading-relaxed text-base-content/35">
            <span className="text-base-content/55">Risk notice:</span> memecoins are highly
            volatile and most go to zero. Nothing here is financial, investment or trading advice.
            Figures from DexScreener, GeckoTerminal and RugCheck are third-party data and may be
            delayed or wrong. Launching a token does not make it valuable, and selling into a thin
            curve will move the price against you.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-[11px] text-base-content/30 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 rugpulltool. Not affiliated with pump.fun, bonk.fun or Solana Labs.</p>
            <p>Built on Solana · Verify every contract yourself.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
