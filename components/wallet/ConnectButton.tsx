"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function ConnectButton({ className = "" }: { className?: string }) {
  return (
    <div className="shrink-0 max-w-full">
      <WalletMultiButton className={`btn btn-primary btn-sm text-xs sm:text-sm px-2.5 sm:px-3 h-8 sm:h-9 min-h-0 truncate ${className}`} />
    </div>
  );
}
