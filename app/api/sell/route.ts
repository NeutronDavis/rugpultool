import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRADE_LOCAL_URL = "https://pumpportal.fun/api/trade-local";
const SUPPORTED_POOLS = new Set(["pump", "bonk"]);
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

interface SellRequest {
  publicKey?: string;
  mint?: string;
  amount?: number; // UI units of the token (not raw lamports)
  slippage?: number;
  priorityFee?: number;
  pool?: string;
}

/**
 * Builds an unsigned pump.fun `sell` transaction.
 *
 * This is an ordinary market exit: the wallet sells tokens it holds into the
 * bonding curve. Nothing here is hidden — the resulting transaction is public
 * and the seller's remaining position is visible to anyone watching the coin.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.entitled) {
    return NextResponse.json(
      { error: "A paid package is required to sell a position." },
      { status: 402 }
    );
  }

  let body: SellRequest;
  try {
    body = (await req.json()) as SellRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { publicKey, mint } = body;
  const pool = body.pool ?? "pump";

  if (!publicKey || !BASE58_RE.test(publicKey)) {
    return NextResponse.json({ error: "A valid wallet publicKey is required." }, { status: 400 });
  }
  if (!mint || !BASE58_RE.test(mint)) {
    return NextResponse.json({ error: "A valid mint address is required." }, { status: 400 });
  }
  if (!SUPPORTED_POOLS.has(pool)) {
    return NextResponse.json({ error: `Unsupported pool: ${pool}` }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Sell amount must be greater than zero." }, { status: 400 });
  }

  const slippage = clamp(body.slippage ?? 15, 1, 100);
  const priorityFee = clamp(body.priorityFee ?? 0.00005, 0.00001, 0.01);

  let upstream: Response;
  try {
    upstream = await fetch(TRADE_LOCAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        action: "sell",
        mint,
        amount,
        denominatedInSol: "false", // `amount` is a token quantity, not SOL
        slippage,
        priorityFee,
        pool,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach the trade builder: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Trade builder returned ${upstream.status}.`, detail: detail.slice(0, 400) },
      { status: 502 }
    );
  }

  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.length === 0) {
    return NextResponse.json({ error: "Trade builder returned an empty transaction." }, { status: 502 });
  }

  return NextResponse.json({ transaction: Buffer.from(bytes).toString("base64"), mint });
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
