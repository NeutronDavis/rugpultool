import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

import { PLAN_PRICES } from "@/lib/plans";

/**
 * Shown on the paid surfaces when a session exists but no package is active.
 * The server re-checks entitlement, so this is presentation — not the gate.
 */
export function Paywall({
  feature,
  email,
}: {
  feature: string;
  email?: string | null;
}) {
  return (
    <div className="mx-auto w-full max-w-2xl py-6 sm:py-8">
      <div className="card card-border bg-base-200/50">
        <div className="card-body items-center gap-5 sm:gap-6 p-4 sm:p-8 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 ring-1 ring-primary/30">
            <Lock className="h-5 w-5 text-primary" />
          </span>

          <div>
            <h1 className="text-xl font-semibold tracking-tight">Subscription required</h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/55">
              {feature} is part of a paid package. You are signed in
              {email ? ` as ${email}` : ""}, but no package is active on this account yet.
            </p>
          </div>

          <div className="grid w-full gap-2 sm:grid-cols-2">
            {PLAN_PRICES.map((plan) => (
              <div
                key={plan.name}
                className="flex items-center justify-between gap-3 rounded-lg border border-base-300 px-3 py-2 text-left"
              >
                <span className="flex flex-col">
                  <span className="text-[13px] font-medium">{plan.name}</span>
                  <span className="text-[10px] uppercase tracking-[0.1em] text-base-content/35">
                    {plan.note}
                  </span>
                </span>
                <span className="flex items-baseline gap-1 text-[12px] text-base-content/55">
                  <span className="text-sm font-semibold text-base-content/85">{plan.price}</span>
                  SOL
                </span>
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/#pricing" className="btn btn-primary w-full sm:w-auto">
              View packages
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard" className="btn btn-ghost w-full sm:w-auto">
              Back to Rugs
            </Link>
          </div>

          <p className="text-[11px] leading-relaxed text-base-content/30">
            Already paid? Sign out and back in to refresh your access.
          </p>
        </div>
      </div>
    </div>
  );
}
