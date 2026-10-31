import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TRADE_LOCAL_URL = "https://pumpportal.fun/api/trade-local";
const SUPPORTED_POOLS = new Set(["pump", "bonk"]);
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

interface LaunchRequest {
  publicKey?: string;
  mint?: string;
  tokenMetadata?: { name?: string; symbol?: string; uri?: string };
  devBuySol?: number;
  slippage?: number;
  priorityFee?: number;
  pool?: string;
}

/**
 * Builds an unsigned pump.fun `create` transaction for the user's wallet.
 *
 * We never see a private key. The browser generates the mint keypair, this route
 * asks PumpPortal to assemble the instruction set, and the client signs with both
 * the mint keypair and the wallet before broadcasting to our own RPC.
 */
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.entitled) {
    return NextResponse.json(
      { error: "A paid package is required to launch a token." },
      { status: 402 }
    );
  }

  let body: LaunchRequest;
  try {
    body = (await req.json()) as LaunchRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { publicKey, mint, tokenMetadata } = body;
  const name = tokenMetadata?.name?.trim();
  const symbol = tokenMetadata?.symbol?.trim();
  const uri = tokenMetadata?.uri?.trim();
  const pool = body.pool ?? "pump";

  if (!publicKey || !BASE58_RE.test(publicKey)) {
    return NextResponse.json({ error: "A valid wallet publicKey is required." }, { status: 400 });
  }
  if (!mint || !BASE58_RE.test(mint)) {
    return NextResponse.json({ error: "A valid mint address is required." }, { status: 400 });
  }
  if (!name || name.length > 32) {
    return NextResponse.json({ error: "Token name is required (max 32 chars)." }, { status: 400 });
  }
  if (!symbol || !/^[A-Za-z0-9]{1,10}$/.test(symbol)) {
    return NextResponse.json(
      { error: "Symbol is required: 1–10 letters or digits." },
      { status: 400 }
    );
  }
  if (!uri || !/^https?:\/\//.test(uri)) {
    return NextResponse.json({ error: "A valid metadata URI is required." }, { status: 400 });
  }
  if (!SUPPORTED_POOLS.has(pool)) {
    return NextResponse.json({ error: `Unsupported pool: ${pool}` }, { status: 400 });
  }

  const devBuySol = clamp(body.devBuySol ?? 0, 0, 50);
  const slippage = clamp(body.slippage ?? 15, 1, 100);
  const priorityFee = clamp(body.priorityFee ?? 0.00005, 0.00001, 0.01);

  let upstream: Response;
  try {
    upstream = await fetch(TRADE_LOCAL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicKey,
        action: "create",
        tokenMetadata: { name, symbol, uri },
        mint,
        denominatedInSol: "true",
        amount: Math.max(devBuySol, 0.0001),
        slippage,
        priorityFee,
        pool,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Could not reach the launch builder: ${(err as Error).message}` },
      { status: 502 }
    );
  }

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `Launch builder returned ${upstream.status}.`, detail: detail.slice(0, 400) },
      { status: 502 }
    );
  }

  // PumpPortal replies with raw serialized transaction bytes, not JSON.
  const bytes = new Uint8Array(await upstream.arrayBuffer());
  if (bytes.length === 0) {
    return NextResponse.json({ error: "Launch builder returned an empty transaction." }, { status: 502 });
  }

  return NextResponse.json({
    transaction: Buffer.from(bytes).toString("base64"),
    mint,
    pool,
  });
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}
