import { DexScreenerPair, DexScreenerProfile } from "@/types/token";

const PROFILES_URL = "https://api.dexscreener.com/token-profiles/latest/v1";
const BOOSTS_URL = "https://api.dexscreener.com/token-boosts/latest/v1";
const TOKENS_BASE_URL = "https://api.dexscreener.com/tokens/v1/solana";
const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "SolRugWatch/1.0",
      },
    });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

function resolveIconUrl(icon?: string): string | null {
  if (!icon || typeof icon !== "string") return null;
  if (icon.startsWith("http://") || icon.startsWith("https://")) {
    return icon;
  }
  // DexScreener CMS image hash
  return `https://cdn.dexscreener.com/cms/images/${icon}`;
}

export interface CandidateDiscoveryResult {
  mints: string[];
  iconMap: Map<string, string>;
}

/**
 * Discovers candidate Solana token addresses from DexScreener profiles and boosts,
 * and collects any icon URLs provided.
 */
export async function fetchDexScreenerCandidateMints(): Promise<CandidateDiscoveryResult> {
  const mints: Set<string> = new Set();
  const iconMap = new Map<string, string>();

  // 1. Fetch token profiles
  try {
    const res = await fetchWithTimeout(PROFILES_URL);
    if (res.ok) {
      const data: DexScreenerProfile[] = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.chainId?.toLowerCase() === "solana" && item.tokenAddress) {
            const cleanMint = item.tokenAddress.trim();
            mints.add(cleanMint);
            const iconUrl = resolveIconUrl(item.icon) || (item.openGraph ? resolveIconUrl(item.openGraph) : null);
            if (iconUrl) {
              iconMap.set(cleanMint, iconUrl);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[DexScreener] Failed to fetch token profiles:", (err as Error)?.message);
  }

  // 2. Fetch token boosts
  try {
    const res = await fetchWithTimeout(BOOSTS_URL);
    if (res.ok) {
      const data: DexScreenerProfile[] = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.chainId?.toLowerCase() === "solana" && item.tokenAddress) {
            const cleanMint = item.tokenAddress.trim();
            mints.add(cleanMint);
            const iconUrl = resolveIconUrl(item.icon) || (item.openGraph ? resolveIconUrl(item.openGraph) : null);
            if (iconUrl && !iconMap.has(cleanMint)) {
              iconMap.set(cleanMint, iconUrl);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("[DexScreener] Failed to fetch token boosts:", (err as Error)?.message);
  }

  return {
    mints: Array.from(mints),
    iconMap,
  };
}

/**
 * Enriches a list of Solana mint addresses using DexScreener's batch endpoint.
 * DexScreener accepts up to 30 comma-separated mint addresses per request.
 */
export async function fetchDexScreenerPairs(mints: string[]): Promise<Map<string, DexScreenerPair>> {
  const pairMap = new Map<string, DexScreenerPair>();
  if (mints.length === 0) return pairMap;

  // Chunk into batches of up to 30
  const BATCH_SIZE = 30;
  const batches: string[][] = [];
  for (let i = 0; i < mints.length; i += BATCH_SIZE) {
    batches.push(mints.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const commaSeparated = batch.join(",");
    const url = `${TOKENS_BASE_URL}/${commaSeparated}`;

    try {
      const res = await fetchWithTimeout(url);
      if (!res.ok) {
        console.warn(`[DexScreener] Batch fetch returned status ${res.status}`);
        continue;
      }

      const pairs: DexScreenerPair[] = await res.json();
      if (Array.isArray(pairs)) {
        for (const pair of pairs) {
          const baseMint = pair.baseToken?.address;
          if (!baseMint) continue;

          // If multiple pairs exist for the same mint, prefer the one with highest liquidity
          const existing = pairMap.get(baseMint);
          const currentLiq = pair.liquidity?.usd || 0;
          const existingLiq = existing?.liquidity?.usd || 0;

          if (!existing || currentLiq > existingLiq) {
            pairMap.set(baseMint, pair);
          }
        }
      }
    } catch (err) {
      console.warn(`[DexScreener] Batch enrichment failed for chunk:`, (err as Error)?.message);
    }
  }

  return pairMap;
}
