import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { BillingConfigError, PaymentError, confirmPayment } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SIGNATURE_RE = /^[1-9A-HJ-NP-Za-km-z]{64,100}$/;

/**
 * POST /api/billing/verify  { paymentId, signature }
 * Used when the user pays directly from the connected browser wallet, so the
 * client already knows the signature and doesn't need to wait for polling.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to verify a payment." }, { status: 401 });
  }

  let body: { paymentId?: string; signature?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const paymentId = body.paymentId?.trim();
  const signature = body.signature?.trim();
  if (!paymentId) {
    return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
  }
  if (!signature || !SIGNATURE_RE.test(signature)) {
    return NextResponse.json({ error: "A valid transaction signature is required." }, { status: 400 });
  }

  try {
    const state = await confirmPayment({
      paymentId,
      userId: session.user.id,
      signature,
    });
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
    console.error("[billing] verify failed:", (err as Error).message);
    return NextResponse.json({ error: "Could not verify the payment." }, { status: 500 });
  }
}
