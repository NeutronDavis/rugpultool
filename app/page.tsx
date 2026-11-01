import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";

import { PartnerStrip, SolanaMark } from "@/components/brand/PartnerMarks";
import { ScrollProgressBar } from "@/components/landing/ScrollProgressBar";
import {
  FeatureGrid,
  StackSection,
  HowItWorks,
  Pricing,
  Faq,
  Compatibility,
  ClosingCta,
} from "@/components/landing/Sections";

export const metadata = {
  title: "rugpulltool — launch a coin with no liquidity to pull",
  description:
    "Launch Solana memecoins on a bonding curve in one signed transaction. The SOL reserve is program-owned, there is no LP token to pull, and your tokens are yours to sell at any time.",
};

const HERO_STATS = [
  { value: "0", label: "LP tokens to pull" },
  { value: "1", label: "signature to launch" },
  { value: "2", label: "launch venues" },
  { value: "0", label: "keys we hold" },
];

const PREFLIGHT = [
  { label: "Liquidity source", value: "Program-owned curve", good: true },
  { label: "LP token", value: "None exists", good: true },
  { label: "Mint authority", value: "Program-held", good: true },
  { label: "Freeze authority", value: "Disabled", good: true },
  { label: "Dev buy", value: "0.0000 SOL" },
  { label: "Est. network cost", value: "~0.0220 SOL" },
];

export default function LandingPage() {
  return (
    <>
      <ScrollProgressBar />

      {/* Announcement */}
      {/* <div>
        <div className="border-b border-base-300 bg-base-200/60">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-3 py-2 text-[11px] text-center sm:px-6 lg:px-8">
            <span className="badge badge-primary badge-xs" />
            <span className="text-base-content/50">
              New: bonk.fun launches and IPFS-pinned metadata are live.
            </span>
            <Link href="/launch" className="inline-flex items-center gap-1 text-primary hover:underline font-medium">
              Open studio <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div> */}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hairline-grid [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]" />
        <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-3 py-10 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Copy */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-outline badge-sm gap-1.5 border-base-300">
                  <SolanaMark className="h-3 w-3" />
                  Built on Solana
                </span>
                <span className="badge badge-ghost badge-sm text-base-content/40">v1.0</span>
              </div>

              <h1 className="mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance-tight sm:text-5xl lg:text-6xl">
                Launch a coin with
                <br className="hidden sm:block" />{" "}
                <span className="text-primary">no liquidity to pull</span>.
              </h1>

              <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-[15px] leading-relaxed text-base-content/55">
                Mint a Solana memecoin on a bonding curve in one signed transaction. The SOL reserve
                belongs to the launch program, not to a transferable LP token, so there is no pool
                for a creator to drain. Your dev buy is disclosed before you sign. Your tokens stay
                yours — sell at any time at the live market price. One signature and it&apos;s live.
              </p>

              <div className="mt-7 sm:mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="btn btn-primary w-full sm:w-auto">
                  <Zap className="h-4 w-4" />
                  Start launching
                </Link>
                <Link href="#how" className="btn btn-ghost w-full sm:w-auto">
                  Watch how it works
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-base-content/35">
                Radar free forever · No launch fee · No cut of creator revenue
              </p>

              <div className="mt-8 sm:mt-10 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4 sm:gap-x-6 sm:gap-y-5">
                {HERO_STATS.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase leading-tight tracking-[0.12em] text-base-content/35">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-flight panel */}
            <div>
              <div className="card card-border w-full overflow-hidden bg-base-200/70 backdrop-blur">
                <div className="card-body gap-0 p-0">
                  <div className="flex items-center justify-between border-b border-base-300 px-4 py-3 sm:px-5 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                      </span>
                      <span className="text-sm font-medium">Launch pre-flight</span>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-base-content/35">
                      pump.fun
                    </span>
                  </div>

                  <div className="divide-y divide-base-300/60 px-4 sm:px-5">
                    {PREFLIGHT.map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-3 py-2.5 sm:py-3">
                        <span className="text-xs text-base-content/45">{row.label}</span>
                        <span
                          className={`flex items-center gap-1.5 text-xs font-medium text-right ${
                            row.good ? "text-success" : "text-base-content/75"
                          }`}
                        >
                          {row.good && <ShieldCheck className="h-3 w-3 shrink-0" />}
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 sm:px-5 pt-4">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-base-content/35">
                      <span>Authority coverage</span>
                      <span className="text-success">100%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-success" />
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <p className="text-center text-[10px] leading-relaxed text-base-content/35">
                      Figures shown for a zero dev-buy launch. Your own pre-flight updates live.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 sm:mt-14 border-t border-base-300 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[10px] uppercase tracking-[0.18em] text-base-content/30">
                Integrated with
              </span>
              <PartnerStrip />
            </div>
          </div>
        </div>
      </section>

      <FeatureGrid />
      <StackSection />
      <HowItWorks />
      <Pricing />
      <Faq />
      <Compatibility />
      <ClosingCta />
    </>
  );
}
