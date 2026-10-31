import { NextRequest, NextResponse } from "next/server";
import { performScan } from "@/lib/scan";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get("force") === "true";

    const scanData = await performScan(force);

    return NextResponse.json(scanData, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("[API /api/rugs] Scan error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform rug scan",
        message: (error as Error)?.message || "Unknown error",
        lastUpdated: new Date().toISOString(),
        stats: { tokensScanned: 0, ruggedCount: 0, highRiskCount: 0 },
        tokens: [],
      },
      { status: 500 }
    );
  }
}
