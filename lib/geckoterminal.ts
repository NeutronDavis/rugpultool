import { GeckoPoolData } from "@/types/token";

const GECKO_URL = "https://api.geckoterminal.com/api/v2/networks/solana/new_pools";
const TIMEOUT_MS = 8000;

/**
 * Fetches recent new pools on Solana from GeckoTerminal.
 * Extracts base token mint addresses.
 */
export async function fetchGeckoTerminalNewMints(): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(GECKO_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "SolRugWatch/1.0",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn(`[GeckoTerminal] Failed with status ${res.status}`);
      return [];
    }

    const data = await res.json();
    const pools: GeckoPoolData[] = data?.data || [];
    const mints: string[] = [];

    for (const pool of pools) {
      const baseTokenId = pool.relationships?.base_token?.data?.id;
      if (baseTokenId) {
        // ID is formatted as "solana_<mintAddress>"
        const cleanMint = baseTokenId.replace(/^solana_/, "").trim();
        if (cleanMint && cleanMint.length >= 32) {
          mints.push(cleanMint);
        }
      }
    }

    return mints;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      console.warn("[GeckoTerminal] Request timed out");
    } else {
      console.warn("[GeckoTerminal] Fetch error:", (err as Error)?.message || err);
    }
    return [];
  } finally {
    clearTimeout(timeout);
  }
}
