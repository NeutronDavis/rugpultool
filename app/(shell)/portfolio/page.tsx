import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { PositionPanel } from "@/components/portfolio/PositionPanel";
import { Paywall } from "@/components/billing/Paywall";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Positions — SolRugWatch",
  description: "Inspect and exit token positions held by your connected wallet.",
};

export default async function PortfolioPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!session.user.entitled) {
    return <Paywall feature="Positions" email={session.user.email} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-base-content">Positions</h1>
        <p className="mt-1 text-xs sm:text-sm text-base-content/60 max-w-2xl">
          Every SPL balance in your wallet, priced from the deepest live pair, with a market exit.
          Selling is public — your position is visible on-chain whether or not you use this page.
        </p>
      </header>

      <PositionPanel />
    </div>
  );
}
