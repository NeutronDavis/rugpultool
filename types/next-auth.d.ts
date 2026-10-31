import type { DefaultSession } from "next-auth";

export type PlanTier = "FREE" | "TESTER" | "BASIC" | "ADVANCED" | "PREMIUM";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      plan: PlanTier;
      /** True when the account holds a live paid package. */
      entitled: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    plan?: PlanTier;
    /** Epoch ms, or null for lifetime packages. */
    planExpiresAt?: number | null;
  }
}
