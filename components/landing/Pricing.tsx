"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";

import { SolanaMark } from "@/components/brand/PartnerMarks";
import { PLANS, TESTER } from "@/lib/plans";

/* ------------------------------------------------------------------ */
/* Data — everything is priced in SOL, no fiat conversion.             */
/* ------------------------------------------------------------------ */

const BOOST = {
  price: "4.9",
  was: "7",
  items: [
    {
      title: "Social growth package",
      body: "300+ real Discord members and 50+ custom Telegram channel promotions",
      icon: <DiscordMark />,
    },
    {
      title: "Twitter promotion",
      body: "150+ Twitter/X adbots with a trending hashtag strategy",
      icon: <XMark />,
    },
    {
      title: "TikTok exposure",
      body: "Dedicated TikTok account with US-targeted audience reach",
      icon: <TikTokMark />,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export function Pricing() {
  const [boost, setBoost] = useState(false);
  const suffix = boost ? "&boost=1" : "";

  return (
    <section id="pricing" className="border-y border-base-300 bg-base-200/30">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/40">
            Lifetime access
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance-tight sm:text-3xl">
            Choose your plan
          </h2>
          <p className="mt-3 text-sm text-base-content/55">
            Pick the package that matches how many coins you launch.
          </p>
          <p className="mt-2 text-sm text-primary/80">Unlock launch and position controls</p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <span className="text-[11px] text-base-content/40">Display prices in</span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/15 px-3 py-1.5 text-[11px] font-medium text-primary ring-1 ring-primary/40">
            <SolanaMark className="h-3 w-3" />
            SOL
          </span>
        </div>

        {/* Tester — single wide row */}
        <div className="mt-8 card card-border bg-base-200/50">
          <div className="flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold">{TESTER.name}</h3>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {TESTER.tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge badge-outline badge-xs border-base-300 text-[9px] uppercase tracking-[0.08em] text-base-content/45"
                  >
                    {tag}
                  </span>
                ))}
                <span className="badge badge-outline badge-xs border-base-300 text-[9px] uppercase tracking-[0.08em] text-base-content/35">
                  +{TESTER.extra} more
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 border-t border-base-300 md:border-t-0 md:pt-0">
              <div className="text-left sm:text-right flex items-center justify-between sm:block">
                <div className="flex items-center sm:justify-end gap-2 text-[11px]">
                  <span className="text-base-content/30 line-through">{TESTER.was} SOL</span>
                  <span className="font-medium text-primary">-30%</span>
                </div>
                <div className="mt-0.5 flex items-baseline sm:justify-end gap-1.5">
                  <span className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight">
                    {TESTER.price}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-base-content/50">
                    <SolanaMark className="h-3.5 w-3.5" />
                    SOL
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-base-content/35 hidden sm:block">
                  {TESTER.access}
                </div>
              </div>
              <Link href={`/login?plan=tester${suffix}`} className="btn btn-outline w-full sm:w-auto">
                Get started
              </Link>
            </div>
          </div>
        </div>

        {/* Three plans */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`card card-border relative h-full ${
                plan.highlight
                  ? "border-primary/60 bg-base-200 shadow-[0_0_60px_-20px_rgb(255_43_43/0.5)]"
                  : "bg-base-200/50"
              }`}
            >
              {plan.badge && (
                <span
                  className={`badge badge-sm absolute right-3 top-3 uppercase tracking-[0.08em] ${
                    plan.highlight ? "badge-primary" : "badge-outline border-base-300 text-base-content/50"
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="card-body gap-0 p-6">
                <h3 className="text-center text-lg font-semibold tracking-tight">{plan.name}</h3>

                <div className="mt-5 text-center">
                  <div className="flex items-center justify-center gap-2 text-[11px]">
                    <span className="text-base-content/30 line-through">{plan.was} SOL</span>
                    <span className="font-medium text-primary">-30%</span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-center gap-1.5">
                    <span className="text-4xl font-semibold tabular-nums tracking-tight">
                      {plan.price}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-base-content/50">
                      <SolanaMark className="h-3.5 w-3.5" />
                      SOL
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-base-content/35">
                    Lifetime access
                  </div>
                </div>

                <ul className="mt-6 divide-y divide-base-300/60">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.label}
                      className="flex items-center gap-3 py-2.5 text-[13px]"
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                          feature.included ? "bg-primary/15" : "bg-base-300"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
                        ) : (
                          <X className="h-2.5 w-2.5 text-base-content/35" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={
                          feature.included ? "text-base-content/75" : "text-base-content/30"
                        }
                      >
                        {feature.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/login?plan=${plan.name.toLowerCase()}${suffix}`}
                  className={`btn btn-block mt-6 ${
                    plan.highlight ? "btn-primary" : "btn-outline"
                  }`}
                >
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Boost addon */}
        <div className="mt-4 card card-border bg-base-200/50">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-300 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold">Boost addon</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-base-content/30 line-through">
                {BOOST.was} SOL
              </span>
              <span className="text-[11px] font-medium text-primary">-30%</span>
              <span className="ml-1 text-xl sm:text-2xl font-semibold tabular-nums tracking-tight">
                {BOOST.price}
              </span>
              <span className="flex items-center gap-1 text-xs text-base-content/50">
                <SolanaMark className="h-3.5 w-3.5" />
                SOL
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-[13px] text-base-content/50">
              Supercharge your token launch with our premium promotion and marketing package.
            </p>

            <div className="mt-5 sm:mt-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid flex-1 gap-4 sm:gap-6 sm:grid-cols-3">
                {BOOST.items.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-base-300 text-primary">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-base-content/40">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <label className="flex cursor-pointer items-center justify-between sm:justify-start gap-3 w-full lg:w-auto pt-3 border-t border-base-300 lg:border-t-0 lg:pt-0 lg:shrink-0 lg:pl-6">
                <span className="text-xs text-base-content/60 font-medium">Add to any plan</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={boost}
                  onChange={(event) => setBoost(event.target.checked)}
                />
              </label>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] text-base-content/30">
          Prices are charged in SOL at the current network rate. Network and venue fees are
          separate and paid per transaction.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Brand marks                                                         */
/* ------------------------------------------------------------------ */

function DiscordMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.6 12.6 0 0 0-.617-1.25.077.077 0 0 0-.079-.036A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TikTokMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}
