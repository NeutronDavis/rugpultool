"use client";

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

/** Desktop navbar — shown only on lg+ */
export function ConnectButton({ className = "" }: { className?: string }) {
  return (
    <div className="hidden lg:block shrink-0 max-w-full">
      <WalletMultiButton
        className={`btn btn-primary btn-sm text-xs px-2.5 h-9 min-h-0 truncate max-w-[160px] ${className}`}
      />
    </div>
  );
}

/** Mobile dropdown entry — full-width, used inside the mobile menu */
export function ConnectButtonMobile({ className = "" }: { className?: string }) {
  return (
    <WalletMultiButton
      className={`!w-full !justify-start !rounded-btn !bg-transparent !text-base-content hover:!bg-base-300 !text-sm !font-normal !min-h-0 !h-auto !px-3 !py-2 !shadow-none ${className}`}
    />
  );
}
