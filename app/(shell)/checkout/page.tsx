import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { CheckoutClient } from "@/components/billing/CheckoutClient";
import { authOptions } from "@/lib/auth";
import {
  PLAN_RANK,
  normalizePaidPlan,
  planDisplayName,
} from "@/lib/plans";

export const metadata: Metadata = {
  title: "Checkout — rugpulltool",
  description: "Pay in SOL and unlock launch and position controls.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  const plan = normalizePaidPlan(searchParams.plan);
  if (!plan) redirect("/#pricing");

  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(`/login?plan=${plan.toLowerCase()}`);

  const currentPlan = session.user.plan;
  const currentRank = PLAN_RANK[currentPlan as keyof typeof PLAN_RANK] ?? 0;
  const requestedRank = PLAN_RANK[plan];

  // A live higher tier needs no payment. A TESTER buying TESTER again is a
  // renewal, so let that through.
  const alreadyActive =
    session.user.entitled &&
    currentRank >= requestedRank &&
    !(plan === "TESTER" && currentPlan === "TESTER");

  return (
    <div className="py-4 sm:py-8">
      <CheckoutClient
        plan={plan}
        planName={planDisplayName(plan)}
        currentPlan={currentPlan}
        alreadyActive={alreadyActive}
        email={session.user.email}
      />
    </div>
  );
}
