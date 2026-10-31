import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { LaunchStudio } from "@/components/launch/LaunchStudio";
import { Paywall } from "@/components/billing/Paywall";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Launch Studio — SolRugWatch",
  description:
    "Create a Solana meme coin on a bonding curve. No LP token exists, so there is no liquidity to withdraw.",
};

export default async function LaunchPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (!session.user.entitled) {
    return <Paywall feature="Launch Studio" email={session.user.email} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-base-content">Launch Studio</h1>
        <p className="mt-1 text-xs sm:text-sm text-base-content/60 max-w-2xl">
          Mint a token on a bonding curve. Liquidity is program-owned, so there is no LP token
          to pull — the contract cannot rug. Your dev buy is disclosed in pre-flight before you sign.
        </p>
      </header>

      <LaunchStudio />
    </div>
  );
}
