"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AlertOctagon,
  ShieldAlert,
  Radar,
  Clock,
  Radio,
  AlertCircle,
} from "lucide-react";
import type { ScanResponse, RugToken } from "@/types/token";
import { StatCard } from "@/components/StatCard";
import { CountdownRefresh } from "@/components/CountdownRefresh";
import { TokenTable } from "@/components/TokenTable";
import { timeAgo } from "@/lib/utils";

export default function DashboardPage() {
  const [data, setData] = useState<ScanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScan = useCallback(async (force = false) => {
    try {
      if (force) {
        setIsRefreshing(true);
      }
      setError(null);

      const url = force ? "/api/rugs?force=true" : "/api/rugs";
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json: ScanResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      console.error("Dashboard fetch error:", err);
      setError((err as Error)?.message || "Failed to fetch live scanner data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScan(false);
  }, [fetchScan]);

  const tokens: RugToken[] = data?.tokens || [];
  const stats = data?.stats || {
    tokensScanned: 0,
    ruggedCount: 0,
    highRiskCount: 0,
  };

  const lastUpdatedDisplay = data?.lastUpdated
    ? timeAgo(new Date(data.lastUpdated).getTime())
    : "Just now";

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-base-300">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge badge-error badge-soft badge-sm gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" />
              Live heuristics feed
            </span>
            <span className="text-xs text-base-content/50">
              Auto-updating via server-side pipeline
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-2">
            Solana meme coin risk radar
          </h1>
          <p className="text-xs sm:text-sm text-base-content/60 mt-1 max-w-2xl">
            Real-time server-side discovery and security heuristics. All metrics are compiled
            without a database and cached to protect upstream endpoints.
          </p>
        </div>

        <div className="shrink-0">
          <CountdownRefresh
            onRefresh={fetchScan}
            isRefreshing={isRefreshing}
            intervalSeconds={60}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-error alert-soft text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Unable to reach scanner pipeline ({error}). Showing cached state if available.
          </span>
          <button
            onClick={() => fetchScan(true)}
            className="btn btn-xs btn-error ml-auto"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <StatCard
          title="Rugged Tokens"
          value={isLoading ? "..." : stats.ruggedCount}
          subtitle="Flagged by RugCheck data"
          icon={<AlertOctagon className="w-5 h-5 text-error" />}
          variant="danger"
        />

        <StatCard
          title="High Risk Tokens"
          value={isLoading ? "..." : stats.highRiskCount}
          subtitle="Active auths, LP or concentration"
          icon={<ShieldAlert className="w-5 h-5 text-warning" />}
          variant="warn"
        />

        <StatCard
          title="Tokens Scanned"
          value={isLoading ? "..." : stats.tokensScanned}
          subtitle="Recent candidates evaluated"
          icon={<Radar className="w-5 h-5 text-primary" />}
          variant="neutral"
        />

        <StatCard
          title="Pipeline Cache"
          value={isLoading ? "..." : lastUpdatedDisplay}
          subtitle={
            data?.lastUpdated
              ? new Date(data.lastUpdated).toLocaleTimeString()
              : "Synchronizing"
          }
          icon={<Clock className="w-5 h-5 text-success" />}
          variant="success"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span>Detected tokens</span>
            <span className="badge badge-neutral badge-sm">{tokens.length} total</span>
          </h2>
        </div>

        <TokenTable tokens={tokens} isLoading={isLoading} />
      </section>
    </div>
  );
}
