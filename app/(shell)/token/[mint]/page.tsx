"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  AlertOctagon,
  Lock,
  Unlock,
  Key,
  Flame,
  Users,
  Coins,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { TokenDetailResponse } from "@/types/token";
import { CopyButton } from "@/components/CopyButton";
import { CoinLogo } from "@/components/CoinLogo";
import {
  formatUsd,
  formatPercent,
  shortenAddress,
  timeAgo,
} from "@/lib/utils";

export default function TokenDetailPage() {
  const params = useParams();
  const mint = typeof params.mint === "string" ? params.mint : "";

  const [data, setData] = useState<TokenDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!mint) return;

    async function loadTokenDetails() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/token/${mint}`);
        if (!res.ok) {
          throw new Error(`Failed to load token details (Status: ${res.status})`);
        }

        const json: TokenDetailResponse = await res.json();
        setData(json);
      } catch (err: unknown) {
        setError((err as Error)?.message || "Failed to load token analysis");
      } finally {
        setIsLoading(false);
      }
    }

    loadTokenDetails();
  }, [mint]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-40 bg-zinc-800/60 rounded-lg" />
        <div className="h-32 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-44 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
          <div className="h-44 bg-zinc-900/60 border border-zinc-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100">Token Analysis Error</h2>
        <p className="text-sm text-zinc-400">
          {error || "Could not retrieve risk telemetry for this token."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Radar Dashboard</span>
        </Link>
      </div>
    );
  }

  const { token, rawRisks, topHolders } = data;
  const isRugged = token.classification === "RUGGED";

  const dexScreenerUrl = `https://dexscreener.com/solana/${mint}`;
  const rugCheckUrl = `https://rugcheck.xyz/tokens/${mint}`;
  const solscanUrl = `https://solscan.io/token/${mint}`;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="btn btn-ghost btn-xs gap-1.5 border border-base-300 text-base-content/70"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Radar</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="card card-border bg-base-200/60 p-4 sm:p-6 backdrop-blur-md space-y-4 sm:space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Token Identity */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <CoinLogo
              src={token.icon}
              symbol={token.symbol}
              name={token.name}
              size="lg"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-base-content break-words">
                  {token.name}
                </h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-base-300 text-base-content/70">
                  ${token.symbol}
                </span>
                {isRugged ? (
                  <span className="badge badge-sm badge-error badge-soft font-bold gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-error" />
                    RUGGED
                  </span>
                ) : (
                  <span className="badge badge-sm badge-warning badge-soft font-bold gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-warning" />
                    HIGH RISK
                  </span>
                )}
              </div>

              {/* Mint address with copy */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 font-mono text-xs text-base-content/50">
                <span className="hidden sm:inline">Mint:</span>
                <span className="text-base-content/80">{shortenAddress(mint, 8)}</span>
                <CopyButton text={mint} label="Copy" />
              </div>
            </div>
          </div>

          {/* External Action Links */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={dexScreenerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 text-xs gap-1.5"
            >
              <span>DexScreener</span>
              <ExternalLink className="w-3 h-3 text-base-content/50" />
            </a>
            <a
              href={rugCheckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 text-xs gap-1.5"
            >
              <span>RugCheck Report</span>
              <ExternalLink className="w-3 h-3 text-base-content/50" />
            </a>
            <a
              href={solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 text-xs gap-1.5"
            >
              <span>Solscan</span>
              <ExternalLink className="w-3 h-3 text-base-content/50" />
            </a>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-base-300 text-xs">
          <div className="card card-border bg-base-100/70 p-2.5 sm:p-3">
            <span className="text-base-content/40 font-medium text-[10px] sm:text-[11px] uppercase block">
              Pool Liquidity
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-base-content mt-0.5 block">
              {formatUsd(token.liquidityUsd)}
            </span>
          </div>

          <div className="card card-border bg-base-100/70 p-2.5 sm:p-3">
            <span className="text-base-content/40 font-medium text-[10px] sm:text-[11px] uppercase block">
              24h Volume
            </span>
            <span className="text-sm sm:text-base font-extrabold font-mono text-base-content mt-0.5 block">
              {formatUsd(token.volume24h)}
            </span>
          </div>

          <div className="card card-border bg-base-100/70 p-2.5 sm:p-3">
            <span className="text-base-content/40 font-medium text-[10px] sm:text-[11px] uppercase block">
              24h Price Change
            </span>
            <span
              className={`text-sm sm:text-base font-extrabold font-mono mt-0.5 block ${
                (token.priceChange24h || 0) >= 0 ? "text-success" : "text-error"
              }`}
            >
              {formatPercent(token.priceChange24h)}
            </span>
          </div>

          <div className="card card-border bg-base-100/70 p-2.5 sm:p-3">
            <span className="text-base-content/40 font-medium text-[10px] sm:text-[11px] uppercase block">
              Created
            </span>
            <span className="text-sm sm:text-base font-bold text-base-content/80 mt-0.5 block">
              {timeAgo(token.pairCreatedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Safety Analysis Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Mint Authority */}
        <div className="card card-border bg-base-200/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Mint Authority
            </span>
            <Key className="w-4 h-4 text-base-content/40" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {token.mintAuthority ? (
              <>
                <XCircle className="w-5 h-5 text-error shrink-0" />
                <div>
                  <span className="text-sm font-bold text-error block">
                    Active Authority
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    Owner can mint unlimited new tokens
                  </span>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <div>
                  <span className="text-sm font-bold text-success block">
                    Revoked / Disabled
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    No new supply can be created
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Freeze Authority */}
        <div className="card card-border bg-base-200/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              Freeze Authority
            </span>
            <Key className="w-4 h-4 text-base-content/40" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {token.freezeAuthority ? (
              <>
                <XCircle className="w-5 h-5 text-error shrink-0" />
                <div>
                  <span className="text-sm font-bold text-error block">
                    Active Authority
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    Creator can freeze holders&apos; accounts
                  </span>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <div>
                  <span className="text-sm font-bold text-success block">
                    Revoked / Disabled
                  </span>
                  <span className="text-[11px] text-base-content/50">
                    Holder wallets cannot be frozen
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* LP Lock Status */}
        <div className="card card-border bg-base-200/50 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-base-content/50 uppercase tracking-wider">
              LP Lock Status
            </span>
            {token.lpLockedPct >= 80 ? (
              <Lock className="w-4 h-4 text-success" />
            ) : (
              <Unlock className="w-4 h-4 text-warning" />
            )}
          </div>
          <div className="pt-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className={token.lpLockedPct < 50 ? "text-error" : "text-success"}>
                {token.lpLockedPct}% Locked
              </span>
              <span className="text-base-content/40 text-[11px]">
                {token.lpLockedPct < 50 ? "Liquidity at risk" : "Protected"}
              </span>
            </div>
            <div className="w-full h-2 bg-base-300 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  token.lpLockedPct < 50 ? "bg-error" : "bg-success"
                }`}
                style={{ width: `${Math.min(100, Math.max(0, token.lpLockedPct))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flagged Risks Section */}
      <div className="card card-border bg-base-200/50 p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="text-base font-bold text-base-content">
              RugCheck Flagged Risks & Heuristics
            </h3>
          </div>
          <span className="badge badge-neutral font-mono text-xs">
            Risk Score: {token.riskScore}
          </span>
        </div>

        {rawRisks.length === 0 ? (
          <p className="text-xs text-base-content/40 italic py-2">
            No specific risk tags returned from RugCheck report.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {rawRisks.map((risk, index) => {
              const isDanger = risk.level === "danger";
              return (
                <div
                  key={index}
                  className={`p-3.5 rounded-xl border ${
                    isDanger
                      ? "bg-error/10 border-error/25 text-error"
                      : "bg-warning/10 border-warning/25 text-warning"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      {isDanger ? (
                        <AlertOctagon className="w-3.5 h-3.5 text-error" />
                      ) : (
                        <ShieldAlert className="w-3.5 h-3.5 text-warning" />
                      )}
                      {risk.name}
                    </span>
                    <span
                      className={`badge badge-xs font-mono uppercase font-bold ${
                        isDanger ? "badge-error" : "badge-warning"
                      }`}
                    >
                      {risk.level}
                    </span>
                  </div>
                  <p className="text-xs text-base-content/60 leading-relaxed mt-1">
                    {risk.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Holders Concentration */}
      <div className="card card-border bg-base-200/50 p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-base font-bold text-base-content">
            Top Holder Concentration
          </h3>
        </div>

        {topHolders.length === 0 ? (
          <p className="text-xs text-base-content/40 italic py-2">
            Holder distribution breakdown is currently not available for this pool.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-box border border-base-300">
            <table className="table table-xs sm:table-sm table-zebra w-full text-left">
              <thead>
                <tr className="border-b border-base-300 text-base-content/45 uppercase text-[11px]">
                  <th>#</th>
                  <th>Holder Address</th>
                  <th className="text-right">Ownership %</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Insider Status</th>
                </tr>
              </thead>
              <tbody>
                {topHolders.slice(0, 10).map((holder, idx) => (
                  <tr key={idx} className="hover">
                    <td className="text-base-content/40 font-mono">
                      {idx + 1}
                    </td>
                    <td className="font-mono text-base-content/80">
                      <div className="flex items-center gap-1">
                        <span>{shortenAddress(holder.address, 4)}</span>
                        <CopyButton text={holder.address} />
                      </div>
                    </td>
                    <td className="text-right font-mono font-bold">
                      <span
                        className={
                          holder.pct > 20
                            ? "text-error"
                            : holder.pct > 10
                            ? "text-warning"
                            : "text-base-content/80"
                        }
                      >
                        {holder.pct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-right font-mono text-base-content/60">
                      {holder.uiAmount?.toLocaleString() || holder.amount.toLocaleString()}
                    </td>
                    <td className="text-center">
                      {holder.insider ? (
                        <span className="badge badge-xs badge-error badge-soft font-bold">
                          Insider
                        </span>
                      ) : (
                        <span className="text-[11px] text-base-content/40">Public</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Safety Notice Pill */}
      <div className="alert alert-warning alert-soft text-xs flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-warning" />
        <div className="leading-relaxed">
          <strong>Safety Notice:</strong> Risk indicators are <span className="underline font-semibold">&quot;Flagged by RugCheck data&quot;</span> and do not constitute accusations of malicious fraud. Automated contract scanners can produce false positives on newly launched tokens with non-standard launch pads or custom staking mechanisms.
        </div>
      </div>
    </div>
  );
}
