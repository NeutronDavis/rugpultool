"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import WalletProviders from "./WalletProviders";

/**
 * The wallet context is a client component, but it must still render during SSR
 * so the rest of the app (dashboard, token pages, marketing copy) stays
 * server-rendered. Disabling SSR here would blank the entire document body.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <WalletProviders>{children}</WalletProviders>
    </SessionProvider>
  );
}
