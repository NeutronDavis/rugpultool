import { PublicKey, type Connection } from "@solana/web3.js";

/** Legacy SPL Token program. pump.fun and bonk.fun mints both live here. */
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export interface HeldToken {
  mint: string;
  amountUi: number;
  decimals: number;
  name: string;
  symbol: string;
  priceUsd: number | null;
  valueUsd: number | null;
  pool: "pump" | "bonk";
}

interface ParsedTokenAccount {
  account: {
    data: {
      parsed: {
        info: {
          mint: string;
          tokenAmount: { uiAmount: number | null; decimals: number };
        };
      };
    };
  };
}

interface DexPair {
  baseToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
  dexId?: string;
}

function poolFor(dexId?: string): "pump" | "bonk" {
  return dexId?.toLowerCase().includes("bonk") ? "bonk" : "pump";
}

/**
 * Reads every non-zero SPL balance the wallet holds, then enriches the mints
 * with on-chain-curve pricing from DexScreener (batched 30 at a time).
 */
export async function loadHoldings(
  connection: Connection,
  owner: PublicKey
): Promise<HeldToken[]> {
  const { value } = (await connection.getParsedTokenAccountsByOwner(owner, {
    programId: TOKEN_PROGRAM_ID,
  })) as { value: ParsedTokenAccount[] };

  const balances = new Map<string, { amountUi: number; decimals: number }>();
  for (const entry of value) {
    const info = entry.account.data.parsed.info;
    const ui = info.tokenAmount.uiAmount;
    if (!ui || ui <= 0) continue;
    balances.set(info.mint, { amountUi: ui, decimals: info.tokenAmount.decimals });
  }

  const mints = Array.from(balances.keys());
  if (mints.length === 0) return [];

  const priceMap = new Map<string, DexPair>();
  for (let i = 0; i < mints.length; i += 30) {
    const batch = mints.slice(i, i + 30);
    try {
      const res = await fetch(
        `https://api.dexscreener.com/tokens/v1/solana/${batch.join(",")}`,
        { signal: AbortSignal.timeout(8_000) }
      );
      if (!res.ok) continue;
      const pairs = (await res.json()) as DexPair[];
      if (!Array.isArray(pairs)) continue;
      for (const pair of pairs) {
        const addr = pair.baseToken?.address;
        if (!addr) continue;
        // Keep the deepest pair so thin forks don't skew the quote.
        const existing = priceMap.get(addr);
        if (!existing || (pair.liquidity?.usd ?? 0) > (existing.liquidity?.usd ?? 0)) {
          priceMap.set(addr, pair);
        }
      }
    } catch {
      // Pricing is best-effort; balances still render without it.
    }
  }

  return mints
    .map((mint) => {
      const bal = balances.get(mint)!;
      const pair = priceMap.get(mint);
      const priceUsd = pair?.priceUsd ? Number(pair.priceUsd) : null;
      return {
        mint,
        amountUi: bal.amountUi,
        decimals: bal.decimals,
        name: pair?.baseToken?.name ?? "Unknown token",
        symbol: pair?.baseToken?.symbol ?? mint.slice(0, 4).toUpperCase(),
        priceUsd: Number.isFinite(priceUsd) ? priceUsd : null,
        valueUsd:
          priceUsd != null && Number.isFinite(priceUsd) ? priceUsd * bal.amountUi : null,
        pool: poolFor(pair?.dexId),
      };
    })
    .sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
}
