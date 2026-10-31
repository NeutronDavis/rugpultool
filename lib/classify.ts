import { TokenClassification } from "@/types/token";
import { ParsedRugAnalysis } from "./rugcheck";

export interface ClassificationInput {
  analysis: ParsedRugAnalysis;
  liquidityUsd: number;
}

/**
 * Classifies a token according to defined safety rules:
 * - "RUGGED": RugCheck flagged as rugged OR liquidity is under $1,000 combined with a high risk score.
 * - "HIGH_RISK": Not rugged, but exhibits serious structural flags:
 *   - Active mint authority
 *   - Active freeze authority
 *   - Unlocked LP (lpLockedPct < 50 or unlocked LP risk)
 *   - Top holder holds over 50%
 * - Returns null for safe or unflagged tokens (they are excluded from the list).
 */
export function classifyToken(input: ClassificationInput): TokenClassification | null {
  const { analysis, liquidityUsd } = input;

  const hasHighRiskScore =
    analysis.score >= 1000 ||
    analysis.risks.some((r) => r.level === "danger" || r.score && r.score >= 2000);

  // 1. Check for RUGGED
  if (analysis.rugged || (liquidityUsd < 1000 && hasHighRiskScore)) {
    return "RUGGED";
  }

  // 2. Check for HIGH_RISK
  // Active mint authority
  const hasActiveMintAuth = Boolean(
    analysis.mintAuthority &&
    analysis.mintAuthority.toLowerCase() !== "disabled" &&
    analysis.mintAuthority.toLowerCase() !== "revoked"
  ) || analysis.risks.some((r) =>
    r.name.toLowerCase().includes("mint authority") &&
    !r.name.toLowerCase().includes("disabled") &&
    !r.name.toLowerCase().includes("revoked")
  );

  // Active freeze authority
  const hasActiveFreezeAuth = Boolean(
    analysis.freezeAuthority &&
    analysis.freezeAuthority.toLowerCase() !== "disabled" &&
    analysis.freezeAuthority.toLowerCase() !== "revoked"
  ) || analysis.risks.some((r) =>
    r.name.toLowerCase().includes("freeze authority") &&
    !r.name.toLowerCase().includes("disabled") &&
    !r.name.toLowerCase().includes("revoked")
  );

  // Unlocked LP
  const hasUnlockedLp =
    analysis.lpLockedPct < 50 ||
    analysis.risks.some((r) =>
      r.name.toLowerCase().includes("unlocked") ||
      r.name.toLowerCase().includes("lp unlocked") ||
      r.description.toLowerCase().includes("unlocked")
    );

  // Top holder concentration over 50%
  const hasTopHolderOver50 = Boolean(
    (analysis.topHolderPct !== null && analysis.topHolderPct > 50) ||
    analysis.risks.some((r) =>
      (r.name.toLowerCase().includes("single holder") ||
       r.name.toLowerCase().includes("top 10 holders")) &&
      (r.description.includes("70%") ||
       r.description.includes("80%") ||
       r.description.includes("90%") ||
       r.description.includes("50%"))
    )
  );

  if (hasActiveMintAuth || hasActiveFreezeAuth || hasUnlockedLp || hasTopHolderOver50) {
    return "HIGH_RISK";
  }

  return null;
}
