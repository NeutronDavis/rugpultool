import Link from "next/link";
import {
  ShieldAlert,
  Server,
  Layers,
  Activity,
  AlertTriangle,
  ArrowLeft,
  Search,
  ExternalLink,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 py-2 sm:py-4">
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

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary mb-3">
          <Activity className="w-3.5 h-3.5" />
          <span>Architecture & Heuristics</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-base-content tracking-tight">
          About RugPullTool
        </h1>
        <p className="text-sm sm:text-base text-base-content/60 mt-2 leading-relaxed">
          RugPullTool is a serverless, database-free threat intelligence radar for the Solana, BNB and Robinhood meme coin ecosystem. It scans newly deployed liquidity pools and applies deterministic risk classification heuristics in real time.
        </p>
      </div>

      {/* Legal & Safety Copy Banner */}
      <div className="alert alert-warning alert-soft text-xs space-y-2 p-4 sm:p-5">
        <div className="flex items-center gap-2 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
          <span>Important Legal & Safety Disclaimer</span>
        </div>
        <p className="text-xs text-base-content/70 leading-relaxed">
          All data displayed across SolRugWatch is automatically compiled from third-party APIs (DexScreener, GeckoTerminal, and RugCheck) and does not constitute financial, investment, legal, or trading advice. Classifications and badges are <strong className="underline">&quot;Flagged by RugCheck data&quot;</strong> and are heuristic indicators, not accusations of illegal conduct or intentional fraud. SolRugWatch never states that any specific project is a scam.
        </p>
      </div>

      {/* Methodology Section */}
      <section className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center gap-2">
          <Layers className="w-5 h-5 text-success" />
          <span>Data Pipeline Methodology</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="card card-border bg-base-200/50 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center text-success font-bold text-xs">
              01
            </div>
            <h3 className="text-sm font-bold text-base-content">Discovery</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Fetches recently created liquidity pools and promoted tokens from GeckoTerminal and DexScreener (profiles and boosts). Merges and deduplicates candidate mint addresses up to 40 tokens per cycle.
            </p>
          </div>

          <div className="card card-border bg-base-200/50 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center text-primary font-bold text-xs">
              02
            </div>
            <h3 className="text-sm font-bold text-base-content">Enrichment</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Batches mints in queries of up to 30 into DexScreener&apos;s multi-token API to retrieve live pricing, USD liquidity, 24-hour transaction volumes, price movements, and pair metadata.
            </p>
          </div>

          <div className="card card-border bg-base-200/50 p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-base-300 flex items-center justify-center text-error font-bold text-xs">
              03
            </div>
            <h3 className="text-sm font-bold text-base-content">Risk Analysis</h3>
            <p className="text-xs text-base-content/60 leading-relaxed">
              Analyzes each token through RugCheck with strict concurrency limits (max 5 simultaneous requests) to evaluate contract authorities, LP lock status, top holder concentrations, and risk scores.
            </p>
          </div>
        </div>
      </section>

      {/* Classification Rules */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <span>Classification Heuristics</span>
        </h2>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-error/10 border border-error/25 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sm badge-error font-bold">
                RUGGED
              </span>
              <span className="text-xs font-semibold text-error">
                Confirmed Liquidity Drain or RugCheck Rug Flag
              </span>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed pl-1">
              Triggered when RugCheck explicitly flags the token as rugged, OR when liquidity is drained below $1,000 USD while simultaneously carrying a high danger risk score.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-warning/10 border border-warning/25 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sm badge-warning font-bold">
                HIGH RISK
              </span>
              <span className="text-xs font-semibold text-warning">
                Structural Vulnerabilities Detected
              </span>
            </div>
            <p className="text-xs text-base-content/60 leading-relaxed pl-1">
              Triggered when the token is not yet rugged, but exhibits one or more dangerous architectural traits: active (unrevoked) mint authority, active freeze authority, unlocked LP (&lt; 50% locked), or a single holder owning more than 50% of the token supply.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-base-200/60 border border-base-300 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-sm badge-neutral font-bold">
                IGNORED
              </span>
              <span className="text-xs font-semibold text-base-content/60">
                Safe or Low Risk Tokens
              </span>
            </div>
            <p className="text-xs text-base-content/50 leading-relaxed pl-1">
              Tokens with revoked mint and freeze authorities, adequate liquidity, and locked LP pools are excluded from the radar to maintain high signal-to-noise ratio.
            </p>
          </div>
        </div>
      </section>

      {/* Zero Database & Caching Architecture */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-base-content flex items-center gap-2">
          <Server className="w-5 h-5 text-success" />
          <span>Zero-Database &amp; Caching Architecture</span>
        </h2>
        <div className="card card-border bg-base-200/50 p-4 sm:p-5 text-xs text-base-content/60 leading-relaxed space-y-3">
          <p>
            SolRugWatch runs entirely without a database or ORM. All telemetry is aggregated server-side via Next.js App Router API handlers.
          </p>
          <ul className="list-disc list-inside space-y-1 text-base-content/75">
            <li>
              <strong>5-Minute TTL Cache:</strong> Results are cached for 300 seconds using in-memory and HTTP edge cache headers.
            </li>
            <li>
              <strong>Thundering Herd Protection:</strong> Concurrent visitor requests during a cache miss share a single in-flight scan promise, preventing duplicate upstream fetches.
            </li>
            <li>
              <strong>Browser Protection:</strong> Visitors never make direct calls from their browsers to RugCheck, DexScreener, or GeckoTerminal, completely eliminating client IP rate limits.
            </li>
          </ul>
        </div>
      </section>

      {/* Known Limitations */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-base-content">
          Known Limitations &amp; Future Scope
        </h3>
        <ul className="text-xs text-base-content/60 space-y-2 list-disc list-inside">
          <li>
            <strong>Ephemeral History:</strong> Because there is no persistent database, historical token telemetry is not stored long-term.
          </li>
          <li>
            <strong>Discovery Coverage:</strong> Discovery focuses on the latest 40 candidates from GeckoTerminal new pools and DexScreener promoted tokens. Tokens launched on private bonding curves before Raydium/Orca migration may not appear immediately.
          </li>
          <li>
            <strong>Suggested Next Steps:</strong> Adding optional WebSocket listeners for real-time Solana on-chain Raydium CPMM program logs, and export to CSV/JSON for security researchers.
          </li>
        </ul>
      </section>
    </div>
  );
}
