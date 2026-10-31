import { RugToken, ScanResponse } from "@/types/token";
import { fetchGeckoTerminalNewMints } from "./geckoterminal";
import { fetchDexScreenerCandidateMints, fetchDexScreenerPairs } from "./dexscreener";
import { analyzeMintsBatch, fetchRugCheckNewMints } from "./rugcheck";
import { classifyToken } from "./classify";
import { cache } from "./cache";

const MAX_CANDIDATE_MINTS = 40;

/**
 * Runs the complete server-side scanning pipeline:
 * 1. Discover candidates from GeckoTerminal & DexScreener
 * 2. Enrich with DexScreener pairs
 * 3. Analyze with RugCheck (controlled concurrency)
 * 4. Classify tokens into RUGGED / HIGH_RISK
 * 5. Return sorted results and scan stats
 */
export async function performScan(force = false): Promise<ScanResponse> {
  // Check cache first if not forced
  if (!force) {
    const cached = cache.getScanResult();
    if (cached) {
      return cached;
    }
  }

  // Prevent multiple concurrent scans (thundering herd protection)
  const existingInFlight = cache.getInFlightScan();
  if (existingInFlight) {
    return existingInFlight;
  }

  const scanPromise = (async () => {
    try {
      // 1. DISCOVERY: Concurrent fetch from GeckoTerminal, DexScreener, and RugCheck
      const [geckoMints, dexCandidates, rugcheckMints] = await Promise.all([
        fetchGeckoTerminalNewMints(),
        fetchDexScreenerCandidateMints(),
        fetchRugCheckNewMints(),
      ]);

      // Merge and de-duplicate
      const candidateSet = new Set<string>();
      for (const m of geckoMints) candidateSet.add(m);
      for (const m of dexCandidates.mints) candidateSet.add(m);
      for (const m of rugcheckMints) candidateSet.add(m);

      const allCandidates = Array.from(candidateSet).slice(0, MAX_CANDIDATE_MINTS);
      console.log(`[Scan] Discovered ${candidateSet.size} unique candidates. Scanning top ${allCandidates.length}...`);

      if (allCandidates.length === 0) {
        const emptyResult: ScanResponse = {
          lastUpdated: new Date().toISOString(),
          stats: { tokensScanned: 0, ruggedCount: 0, highRiskCount: 0 },
          tokens: [],
        };
        cache.setScanResult(emptyResult);
        return emptyResult;
      }

      // 2. ENRICHMENT: DexScreener batch endpoint
      const pairsMap = await fetchDexScreenerPairs(allCandidates);

      // 3. ANALYSIS: RugCheck batch analysis
      const analysisMap = await analyzeMintsBatch(allCandidates);

      // 4. CLASSIFICATION & NORMALIZATION
      const classifiedTokens: RugToken[] = [];
      let ruggedCount = 0;
      let highRiskCount = 0;

      for (const mint of allCandidates) {
        const pair = pairsMap.get(mint);
        const analysis = analysisMap.get(mint);

        // If RugCheck failed or was unreachable, skip to ensure high data quality
        if (!analysis) {
          continue;
        }

        const liquidityUsd = pair?.liquidity?.usd || 0;
        const classification = classifyToken({ analysis, liquidityUsd });

        // Skip tokens that are not flagged as RUGGED or HIGH_RISK
        if (!classification) {
          continue;
        }

        if (classification === "RUGGED") {
          ruggedCount++;
        } else {
          highRiskCount++;
        }

        // Extract metadata safely from DexScreener pair or fallbacks
        const name = pair?.baseToken?.name || (pair as unknown as { name?: string })?.name || `Token ${mint.slice(0, 6)}`;
        const symbol = pair?.baseToken?.symbol || (pair as unknown as { symbol?: string })?.symbol || "UNKNOWN";
        const priceUsd = pair?.priceUsd ? parseFloat(pair.priceUsd) : null;
        const volume24h = pair?.volume?.h24 || 0;
        const priceChange24h = pair?.priceChange?.h24 ?? null;
        const pairCreatedAt = pair?.pairCreatedAt || null;
        const pairUrl = pair?.url || `https://dexscreener.com/solana/${mint}`;
        const icon =
          pair?.info?.imageUrl ||
          pair?.info?.openGraph ||
          dexCandidates.iconMap.get(mint) ||
          analysis.image ||
          null;

        const tokenItem: RugToken = {
          mint,
          name,
          symbol,
          priceUsd,
          liquidityUsd,
          volume24h,
          priceChange24h,
          pairCreatedAt,
          pairUrl,
          icon,
          classification,
          riskScore: analysis.score,
          lpLockedPct: analysis.lpLockedPct,
          mintAuthority: analysis.mintAuthority,
          freezeAuthority: analysis.freezeAuthority,
          topHolderPct: analysis.topHolderPct,
          risks: analysis.risks,
          detectedAt: new Date().toISOString(),
        };

        classifiedTokens.push(tokenItem);
      }

      // 5. SORT: Newest first (by pairCreatedAt descending, then detectedAt)
      classifiedTokens.sort((a, b) => {
        const timeA = a.pairCreatedAt || 0;
        const timeB = b.pairCreatedAt || 0;
        return timeB - timeA;
      });

      const response: ScanResponse = {
        lastUpdated: new Date().toISOString(),
        stats: {
          tokensScanned: allCandidates.length,
          ruggedCount,
          highRiskCount,
        },
        tokens: classifiedTokens,
      };

      cache.setScanResult(response);
      return response;
    } finally {
      cache.setInFlightScan(null);
    }
  })();

  cache.setInFlightScan(scanPromise);
  return scanPromise;
}
