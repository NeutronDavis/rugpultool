import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { BillingConfigError, PaymentError, getPaymentState } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/billing/status?paymentId=...
 * Polls the chain for the checkout's reference key and confirms the payment if
 * a matching transfer has landed. Safe to call repeatedly.
 */
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to check a payment." }, { status: 401 });
  }

  const paymentId = new URL(req.url).searchParams.get("paymentId")?.trim();
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
  }

  try {
    const state = await getPaymentState({ paymentId, userId: session.user.id });
    return NextResponse.json({
      status: state.status,
      plan: state.plan,
      planExpiresAt: state.planExpiresAt?.toISOString() ?? null,
      message: state.message ?? null,
    });
  } catch (err) {
    if (err instanceof BillingConfigError) {
      console.error("[billing] configuration error:", err.message);
      return NextResponse.json({ error: err.message }, { status: 503 });
    }
    if (err instanceof PaymentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[billing] status failed:", (err as Error).message);
    return NextResponse.json({ error: "Could not check the payment." }, { status: 500 });
  }
}
