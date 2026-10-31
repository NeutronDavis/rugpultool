import { RugCheckReport, RugCheckSummary, TokenRisk } from "@/types/token";

const RUGCHECK_BASE = "https://api.rugcheck.xyz/v1/tokens";
const TIMEOUT_MS = 8000;
const MAX_CONCURRENCY = 5;
const BATCH_DELAY_MS = 150;

export interface ParsedRugAnalysis {
  rugged: boolean;
  score: number;
  risks: TokenRisk[];
  mintAuthority: string | null;
  freezeAuthority: string | null;
  lpLockedPct: number;
  topHolderPct: number | null;
  image?: string | null;
  rawReport?: RugCheckReport;
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "User-Agent": "SolRugWatch/1.0",
  };
  const key = process.env.RUGCHECK_API_KEY;
  if (key && key.trim()) {
    headers["Authorization"] = `Bearer ${key.trim()}`;
  }
  return headers;
}

/**
 * Fetch helper with timeout and retry logic.
 */
async function fetchWithRetry(url: string, retries = 1): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        return res;
      }

      // If rate limited (429), wait before retrying
      if (res.status === 429 && attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }

      // 404 or other 4xx usually means report doesn't exist yet
      if (res.status === 404) {
        return null;
      }
    } catch (err: unknown) {
      if (attempt >= retries) {
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      clearTimeout(timeout);
    }
  }
  return null;
}

/**
 * Parses risks array from RugCheck response.
 */
function normalizeRisks(rawRisks?: Array<{ name?: string; level?: string; description?: string; score?: number }>): TokenRisk[] {
  if (!Array.isArray(rawRisks)) return [];
  return rawRisks.map((r) => ({
    name: r.name || "Unknown Risk",
    level: (r.level === "danger" ? "danger" : r.level === "warn" ? "warn" : "info") as TokenRisk["level"],
    description: r.description || "",
    score: typeof r.score === "number" ? r.score : 0,
  }));
}

/**
 * Analyze a single token mint by querying /report/summary first,
 * falling back to /report if necessary or when summary lacks critical fields.
 */
export async function analyzeTokenMint(mint: string): Promise<ParsedRugAnalysis | null> {
  const summaryUrl = `${RUGCHECK_BASE}/${mint}/report/summary`;
  const reportUrl = `${RUGCHECK_BASE}/${mint}/report`;

  let summaryData: RugCheckSummary | null = null;
  let reportData: RugCheckReport | null = null;

  // 1. Try summary first
  const summaryRes = await fetchWithRetry(summaryUrl, 1);
  if (summaryRes && summaryRes.ok) {
    try {
      summaryData = await summaryRes.json();
    } catch {
      summaryData = null;
    }
  }

  // 2. If summary is missing or if we need full report details, fetch /report
  // We fall back to /report if summary failed OR summary doesn't give mintAuthority info
  if (!summaryData) {
    const reportRes = await fetchWithRetry(reportUrl, 1);
    if (reportRes && reportRes.ok) {
      try {
        reportData = await reportRes.json();
      } catch {
        reportData = null;
      }
    }
  }

  if (!summaryData && !reportData) {
    return null;
  }

  const rawRisks = summaryData?.risks || reportData?.risks || [];
  const risks = normalizeRisks(rawRisks);
  const score = summaryData?.score ?? reportData?.score ?? 0;

  // Rugged determination:
  // If reportData exists and has boolean rugged, use it.
  // Otherwise check if summaryData has rugged, or if risks explicitly say rugged.
  let rugged = reportData?.rugged ?? summaryData?.rugged ?? false;
  if (!rugged) {
    const hasRugRisk = risks.some((r) =>
      r.name.toLowerCase().includes("rugged") ||
      r.description.toLowerCase().includes("rugged")
    );
    if (hasRugRisk) {
      rugged = true;
    }
  }

  // Mint authority
  let mintAuthority: string | null = reportData?.mintAuthority ?? null;
  if (mintAuthority === undefined) mintAuthority = null;
  if (mintAuthority === null && summaryData) {
    const hasMintAuthRisk = risks.some((r) =>
      r.name.toLowerCase().includes("mint authority") &&
      !r.name.toLowerCase().includes("disabled") &&
      !r.name.toLowerCase().includes("revoked")
    );
    if (hasMintAuthRisk) {
      mintAuthority = "Active";
    }
  }

  // Freeze authority
  let freezeAuthority: string | null = reportData?.freezeAuthority ?? null;
  if (freezeAuthority === undefined) freezeAuthority = null;
  if (freezeAuthority === null && summaryData) {
    const hasFreezeAuthRisk = risks.some((r) =>
      r.name.toLowerCase().includes("freeze authority") &&
      !r.name.toLowerCase().includes("disabled") &&
      !r.name.toLowerCase().includes("revoked")
    );
    if (hasFreezeAuthRisk) {
      freezeAuthority = "Active";
    }
  }

  // LP locked percentage
  let lpLockedPct = 0;
  if (typeof summaryData?.lpLockedPct === "number") {
    lpLockedPct = summaryData.lpLockedPct;
  } else if (typeof reportData?.lpLockedPct === "number") {
    lpLockedPct = reportData.lpLockedPct;
  } else if (reportData?.markets && reportData.markets.length > 0) {
    lpLockedPct = reportData.markets[0]?.lp?.lpLockedPct ?? 0;
  }

  // Top holder concentration percentage
  let topHolderPct: number | null = null;
  if (reportData?.topHolders && reportData.topHolders.length > 0) {
    topHolderPct = reportData.topHolders[0].pct;
  } else {
    // Attempt extracting from risks descriptions (e.g. "holds more than 70% token supply")
    for (const r of risks) {
      const match = r.description.match(/(\d+(?:\.\d+)?)%/);
      if (match && match[1]) {
        topHolderPct = parseFloat(match[1]);
        break;
      }
    }
  }

  const image = reportData?.fileMeta?.image || null;

  return {
    rugged,
    score,
    risks,
    mintAuthority,
    freezeAuthority,
    lpLockedPct,
    topHolderPct,
    image,
    rawReport: reportData || (summaryData as unknown as RugCheckReport),
  };
}

/**
 * Fetch full report for a single mint (used for detail page).
 */
export async function getFullTokenReport(mint: string): Promise<RugCheckReport | null> {
  const reportUrl = `${RUGCHECK_BASE}/${mint}/report`;
  const summaryUrl = `${RUGCHECK_BASE}/${mint}/report/summary`;

  const reportRes = await fetchWithRetry(reportUrl, 1);
  if (reportRes && reportRes.ok) {
    try {
      return await reportRes.json();
    } catch {
      // Fall through to summary
    }
  }

  const summaryRes = await fetchWithRetry(summaryUrl, 1);
  if (summaryRes && summaryRes.ok) {
    try {
      return await summaryRes.json();
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Fetches recent tokens indexed by RugCheck stats stream.
 */
export async function fetchRugCheckNewMints(): Promise<string[]> {
  try {
    const res = await fetch("https://api.rugcheck.xyz/v1/stats/new_tokens", {
      headers: getAuthHeaders(),
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map((item: { mint?: string }) => item.mint || "").filter((m) => m && m.length >= 32);
      }
    }
  } catch (err) {
    console.warn("[RugCheck] Failed to fetch new_tokens stats:", (err as Error)?.message);
  }
  return [];
}

/**
 * Analyzes multiple mints with controlled concurrency (max 5 at a time)
 * and a short delay between batches to respect rate limits.
 */
export async function analyzeMintsBatch(mints: string[]): Promise<Map<string, ParsedRugAnalysis>> {
  const resultMap = new Map<string, ParsedRugAnalysis>();
  if (mints.length === 0) return resultMap;

  // Process in chunks of MAX_CONCURRENCY
  for (let i = 0; i < mints.length; i += MAX_CONCURRENCY) {
    const chunk = mints.slice(i, i + MAX_CONCURRENCY);

    const promises = chunk.map(async (mint) => {
      try {
        const analysis = await analyzeTokenMint(mint);
        if (analysis) {
          resultMap.set(mint, analysis);
        }
      } catch (err) {
        console.warn(`[RugCheck] Skipped mint ${mint}:`, (err as Error)?.message);
      }
    });

    await Promise.all(promises);

    // Short pause between batches if more remain
    if (i + MAX_CONCURRENCY < mints.length) {
      await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
    }
  }

  return resultMap;
}
