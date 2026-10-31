import { NextRequest, NextResponse } from "next/server";
import { fetchDexScreenerPairs } from "@/lib/dexscreener";
import { getFullTokenReport } from "@/lib/rugcheck";
import { cache } from "@/lib/cache";
import { TokenDetailResponse } from "@/types/token";
import { classifyToken } from "@/lib/classify";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { mint: string } }
) {
  const mint = params.mint?.trim();

  if (!mint || mint.length < 30) {
    return NextResponse.json({ error: "Invalid Solana mint address" }, { status: 400 });
  }

  // Check cache for this token
  const cached = cache.getToken<TokenDetailResponse>(mint);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    const [pairsMap, fullReport] = await Promise.all([
      fetchDexScreenerPairs([mint]),
      getFullTokenReport(mint),
    ]);

    const pair = pairsMap.get(mint);

    if (!pair && !fullReport) {
      return NextResponse.json(
        { error: "Token not found on DexScreener or RugCheck" },
        { status: 404 }
      );
    }

    const liquidityUsd = pair?.liquidity?.usd || 0;
    const risks = (fullReport?.risks || []).map((r) => ({
      name: r.name || "Risk flag",
      level: (r.level === "danger" ? "danger" : r.level === "warn" ? "warn" : "info") as "danger" | "warn" | "info",
      description: r.description || "",
      score: r.score,
    }));

    // Classification
    const parsedAnalysis = {
      rugged: fullReport?.rugged ?? false,
      score: fullReport?.score ?? 0,
      risks,
      mintAuthority: fullReport?.mintAuthority ?? null,
      freezeAuthority: fullReport?.freezeAuthority ?? null,
      lpLockedPct: fullReport?.lpLockedPct ?? fullReport?.markets?.[0]?.lp?.lpLockedPct ?? 0,
      topHolderPct: fullReport?.topHolders?.[0]?.pct ?? null,
      image: fullReport?.fileMeta?.image || null,
    };

    const classification = classifyToken({
      analysis: parsedAnalysis,
      liquidityUsd,
    }) || "HIGH_RISK"; // Fallback to high risk if inspected directly

    const tokenDetail: TokenDetailResponse = {
      token: {
        mint,
        name: pair?.baseToken?.name || (fullReport as unknown as { tokenMeta?: { name?: string } })?.tokenMeta?.name || `Token ${mint.slice(0, 6)}`,
        symbol: pair?.baseToken?.symbol || (fullReport as unknown as { tokenMeta?: { symbol?: string } })?.tokenMeta?.symbol || "UNKNOWN",
        priceUsd: pair?.priceUsd ? parseFloat(pair.priceUsd) : null,
        liquidityUsd,
        volume24h: pair?.volume?.h24 || 0,
        priceChange24h: pair?.priceChange?.h24 ?? null,
        pairCreatedAt: pair?.pairCreatedAt || null,
        pairUrl: pair?.url || `https://dexscreener.com/solana/${mint}`,
        icon: pair?.info?.imageUrl || pair?.info?.openGraph || fullReport?.fileMeta?.image || null,
        classification,
        riskScore: fullReport?.score ?? 0,
        lpLockedPct: parsedAnalysis.lpLockedPct,
        mintAuthority: fullReport?.mintAuthority ?? null,
        freezeAuthority: fullReport?.freezeAuthority ?? null,
        topHolderPct: parsedAnalysis.topHolderPct,
        risks,
        detectedAt: new Date().toISOString(),
      },
      rawRisks: risks,
      topHolders: fullReport?.topHolders || [],
      markets: (fullReport?.markets || []).map((m) => ({
        pubkey: m.pubkey,
        lpLockedPct: m.lp?.lpLockedPct,
        quotePrice: m.lp?.quotePrice,
      })),
    };

    // Cache token detail for 5 minutes
    cache.setToken(mint, tokenDetail, 300);

    return NextResponse.json(tokenDetail);
  } catch (error) {
    console.error(`[API /api/token/${mint}] Error:`, error);
    return NextResponse.json(
      { error: "Internal server error fetching token details" },
      { status: 500 }
    );
  }
}
