"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ExternalLink,
  Flame,
  ShieldAlert,
  AlertOctagon,
  ArrowUpDown,
  XCircle,
  HelpCircle,
  Eye,
} from "lucide-react";
import { RugToken, TokenClassification } from "@/types/token";
import { CopyButton } from "./CopyButton";
import { CoinLogo } from "./CoinLogo";
import {
  formatUsd,
  formatPercent,
  shortenAddress,
  timeAgo,
} from "@/lib/utils";

type FilterTab = "ALL" | "RUGGED" | "HIGH_RISK";
type SortOption = "newest" | "lowest_liquidity" | "highest_risk" | "volume";

interface TokenTableProps {
  tokens: RugToken[];
  isLoading: boolean;
}

export function TokenTable({ tokens, isLoading }: TokenTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  // Filter & Search
  const filteredTokens = useMemo(() => {
    return tokens.filter((token) => {
      // Tab filter
      if (activeTab === "RUGGED" && token.classification !== "RUGGED") return false;
      if (activeTab === "HIGH_RISK" && token.classification !== "HIGH_RISK") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = token.name.toLowerCase().includes(q);
        const matchesSymbol = token.symbol.toLowerCase().includes(q);
        const matchesMint = token.mint.toLowerCase().includes(q);
        if (!matchesName && !matchesSymbol && !matchesMint) return false;
      }

      return true;
    });
  }, [tokens, activeTab, searchQuery]);

  // Sort
  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
      switch (sortBy) {
        case "lowest_liquidity":
          return a.liquidityUsd - b.liquidityUsd;
        case "highest_risk":
          return b.riskScore - a.riskScore;
        case "volume":
          return b.volume24h - a.volume24h;
        case "newest":
        default:
          return (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0);
      }
    });
  }, [filteredTokens, sortBy]);

  const ruggedCount = useMemo(
    () => tokens.filter((t) => t.classification === "RUGGED").length,
    [tokens]
  );
  const highRiskCount = useMemo(
    () => tokens.filter((t) => t.classification === "HIGH_RISK").length,
    [tokens]
  );

  return (
    <div className="space-y-4">
      {/* Controls Bar: Tabs, Search, Sort */}
      <div className="card card-border bg-base-200/50 p-3 sm:p-4 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-base-300/60 border border-base-300 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("ALL")}
              type="button"
              className={`btn btn-xs sm:btn-sm ${
                activeTab === "ALL"
                  ? "btn-neutral shadow-sm"
                  : "btn-ghost text-base-content/60"
              }`}
            >
              <span>All</span>
              <span className="badge badge-neutral badge-xs">
                {tokens.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("RUGGED")}
              type="button"
              className={`btn btn-xs sm:btn-sm gap-1 ${
                activeTab === "RUGGED"
                  ? "btn-error btn-soft shadow-sm"
                  : "btn-ghost text-base-content/60 hover:text-error"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5 text-error" />
              <span>Rugged</span>
              <span className="badge badge-error badge-xs">
                {ruggedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("HIGH_RISK")}
              type="button"
              className={`btn btn-xs sm:btn-sm gap-1 ${
                activeTab === "HIGH_RISK"
                  ? "btn-warning btn-soft shadow-sm"
                  : "btn-ghost text-base-content/60 hover:text-warning"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-warning" />
              <span>High Risk</span>
              <span className="badge badge-warning badge-xs">
                {highRiskCount}
              </span>
            </button>
          </div>

          {/* Search & Sort Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              <input
                type="text"
                placeholder="Search name, symbol, mint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-sm w-full bg-base-100 border-base-300 pl-8 pr-8 text-xs text-base-content placeholder:text-base-content/40 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
                  aria-label="Clear search"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="select select-sm w-full sm:w-auto bg-base-100 border-base-300 text-xs text-base-content focus:outline-none cursor-pointer"
                aria-label="Sort tokens"
              >
                <option value="newest">Newest First</option>
                <option value="lowest_liquidity">Lowest Liquidity</option>
                <option value="highest_risk">Highest Risk Score</option>
                <option value="volume">Highest 24h Volume</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 bg-zinc-900/40 border border-zinc-800/60 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sortedTokens.length === 0 && (
        <div className="card card-border bg-base-200/40 p-8 sm:p-12 text-center">
          <HelpCircle className="w-10 h-10 mx-auto text-base-content/30 mb-3" />
          <h3 className="text-base font-semibold text-base-content">
            No matching tokens detected
          </h3>
          <p className="text-xs text-base-content/50 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No results found for "${searchQuery}". Try modifying your search query or switching tabs.`
              : "No tokens currently match the high risk or rugged criteria in this scan cycle."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="btn btn-sm btn-outline mt-4 mx-auto"
            >
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      {!isLoading && sortedTokens.length > 0 && (
        <div className="hidden lg:block overflow-x-auto rounded-box border border-base-300 bg-base-200/40">
          <table className="table table-sm table-zebra w-full text-left text-xs">
            <thead>
              <tr className="border-b border-base-300 text-base-content/50 font-semibold tracking-wider uppercase text-[11px]">
                <th>Token</th>
                <th>Mint Address</th>
                <th>Status</th>
                <th className="text-right">Liquidity</th>
                <th className="text-right">24h Volume</th>
                <th className="text-right">24h Change</th>
                <th>Age</th>
                <th>Flagged Risks</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTokens.map((token) => {
                const isRugged = token.classification === "RUGGED";

                return (
                  <tr key={token.mint} className="hover">
                    {/* Token Icon & Name */}
                    <td>
                      <div className="flex items-center gap-2.5">
                        <CoinLogo
                          src={token.icon}
                          symbol={token.symbol}
                          name={token.name}
                          size="md"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-base-content truncate max-w-[130px]" title={token.name}>
                            {token.name}
                          </span>
                          <span className="text-[11px] font-mono text-base-content/50">
                            ${token.symbol}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Mint Address */}
                    <td>
                      <div className="flex items-center gap-1 font-mono text-base-content/60">
                        <span>{shortenAddress(token.mint, 4)}</span>
                        <CopyButton text={token.mint} />
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td>
                      {isRugged ? (
                        <span className="badge badge-sm badge-error badge-soft font-bold gap-1">
                          <AlertOctagon className="w-3 h-3 text-error" />
                          RUGGED
                        </span>
                      ) : (
                        <span className="badge badge-sm badge-warning badge-soft font-bold gap-1">
                          <ShieldAlert className="w-3 h-3 text-warning" />
                          HIGH RISK
                        </span>
                      )}
                    </td>

                    {/* Liquidity */}
                    <td className="text-right font-mono font-semibold text-base-content">
                      {formatUsd(token.liquidityUsd)}
                    </td>

                    {/* 24h Volume */}
                    <td className="text-right font-mono text-base-content/80">
                      {formatUsd(token.volume24h)}
                    </td>

                    {/* 24h Change */}
                    <td className="text-right font-mono font-medium">
                      <span
                        className={
                          (token.priceChange24h || 0) >= 0
                            ? "text-success"
                            : "text-error"
                        }
                      >
                        {formatPercent(token.priceChange24h)}
                      </span>
                    </td>

                    {/* Age */}
                    <td className="text-base-content/60 whitespace-nowrap font-medium">
                      {timeAgo(token.pairCreatedAt)}
                    </td>

                    {/* Top 2 Risk Reasons */}
                    <td className="max-w-xs">
                      <div className="flex flex-col gap-1">
                        {token.risks.slice(0, 2).map((r, idx) => (
                          <span
                            key={idx}
                            title={r.description}
                            className={`inline-block truncate px-2 py-0.5 rounded text-[10px] font-medium ${
                              r.level === "danger"
                                ? "bg-error/15 text-error border border-error/30"
                                : "bg-warning/15 text-warning border border-warning/30"
                            }`}
                          >
                            • {r.name}
                          </span>
                        ))}
                        {token.risks.length === 0 && (
                          <span className="text-[11px] text-base-content/40 italic">
                            Low liquidity heuristic flag
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/token/${token.mint}`}
                          className="btn btn-ghost btn-xs btn-square"
                          title="View In-Depth Analysis"
                          aria-label="View In-Depth Analysis"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href={token.pairUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-xs gap-1 border border-base-300 text-[11px]"
                          title="View on DexScreener"
                        >
                          <span>Dex</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile / Tablet Cards View */}
      {!isLoading && sortedTokens.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:hidden">
          {sortedTokens.map((token) => {
            const isRugged = token.classification === "RUGGED";

            return (
              <div
                key={token.mint}
                className="card card-border bg-base-200/60 p-4 space-y-3"
              >
                {/* Header: Icon, Name, Badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CoinLogo
                      src={token.icon}
                      symbol={token.symbol}
                      name={token.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-base-content truncate max-w-[140px] sm:max-w-[200px]" title={token.name}>
                        {token.name}
                      </h4>
                      <p className="text-xs text-base-content/50 font-mono">
                        ${token.symbol}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isRugged ? (
                      <span className="badge badge-sm badge-error badge-soft font-bold gap-1">
                        <AlertOctagon className="w-3 h-3 text-error" />
                        RUGGED
                      </span>
                    ) : (
                      <span className="badge badge-sm badge-warning badge-soft font-bold gap-1">
                        <ShieldAlert className="w-3 h-3 text-warning" />
                        HIGH RISK
                      </span>
                    )}
                  </div>
                </div>

                {/* Mint copy pill */}
                <div className="flex items-center justify-between bg-base-300/50 px-3 py-1.5 rounded-lg border border-base-300 text-xs font-mono text-base-content/70">
                  <span>{shortenAddress(token.mint, 6)}</span>
                  <CopyButton text={token.mint} label="Copy Mint" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-2 py-2 border-y border-base-300 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-base-content/40 font-medium block">
                      Liquidity
                    </span>
                    <span className="font-mono font-semibold text-base-content">
                      {formatUsd(token.liquidityUsd)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-base-content/40 font-medium block">
                      24h Vol
                    </span>
                    <span className="font-mono text-base-content/80">
                      {formatUsd(token.volume24h)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-base-content/40 font-medium block">
                      Age
                    </span>
                    <span className="text-base-content/70 font-medium">
                      {timeAgo(token.pairCreatedAt)}
                    </span>
                  </div>
                </div>

                {/* Risks list */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-base-content/40 tracking-wider">
                    Flagged by RugCheck:
                  </span>
                  <div className="flex flex-col gap-1">
                    {token.risks.slice(0, 2).map((r, i) => (
                      <div
                        key={i}
                        className={`text-[11px] px-2 py-1 rounded-md border ${
                          r.level === "danger"
                            ? "bg-error/10 border-error/20 text-error"
                            : "bg-warning/10 border-warning/20 text-warning"
                        }`}
                      >
                        {r.name}
                      </div>
                    ))}
                    {token.risks.length === 0 && (
                      <div className="text-[11px] text-base-content/40 italic">
                        Low liquidity heuristic warning
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                  <Link
                    href={`/token/${token.mint}`}
                    className="btn btn-sm btn-primary flex-1 text-xs"
                  >
                    Deep Dive
                  </Link>
                  <a
                    href={token.pairUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-ghost border border-base-300 text-xs gap-1"
                  >
                    <span>DexScreener</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
