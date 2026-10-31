import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  BillingConfigError,
  PaymentError,
  createCheckout,
} from "@/lib/billing";
import { normalizePaidPlan } from "@/lib/plans";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/billing/checkout  { plan: "TESTER" | "BASIC" | "ADVANCED" | "PREMIUM" }
 * Creates (or reuses) a pending Solana Pay intent for the signed-in user.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to start a checkout." }, { status: 401 });
  }

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const plan = normalizePaidPlan(body.plan);
  if (!plan) {
    return NextResponse.json({ error: "Choose a valid paid plan." }, { status: 400 });
  }

  try {
    const payment = await createCheckout(session.user.id, plan);
    return NextResponse.json({ payment });
  } catch (err) {
    if (err instanceof BillingConfigError) {
      console.error("[billing] configuration error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof PaymentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[billing] checkout failed:", (err as Error).message);
    return NextResponse.json({ error: "Could not create the checkout." }, { status: 500 });
  }
}
