# RugPullTool 🛡️

**Live Solana Meme Coin Risk Radar** — A real-time threat intelligence and risk analysis dashboard for freshly launched Solana meme coins, built with **Next.js 14+ (App Router)**, **TypeScript**, and **Tailwind CSS**.

The risk radar itself needs **no database** — tokens are discovered, enriched, and classified server-side and cached with in-memory TTL and Next.js revalidation. A MySQL database (Prisma) is used only for accounts, auth, and subscription plans.

---

## 🌟 Features

- **Multi-Source Discovery Pipeline**: Continuous server-side discovery from GeckoTerminal new pools and DexScreener token profiles & boosts.
- **Batch Enrichment**: High-throughput multi-token enrichment via DexScreener's batch API (up to 30 mints per request).
- **RugCheck Telemetry**: Deep risk heuristics with controlled concurrency (max 5 simultaneous queries with inter-batch delay), automated timeouts, and fallback from `/report/summary` to `/report`.
- **Deterministic Classification**:
  - `RUGGED`: RugCheck flagged rugged, OR liquidity < $1,000 USD combined with high risk score.
  - `HIGH_RISK`: Unlocked LP (< 50%), active mint authority, active freeze authority, or top holder owning > 50%.
- **Live Dashboard**:
  - Stat cards: Rugged Count, High Risk Count, Tokens Scanned, Cache Age.
  - 60-second auto-refresh with visible countdown indicator & instant manual refresh.
  - Filter tabs (All / Rugged / High Risk), live search (name, symbol, mint address), and multi-criteria sorting (Newest, Lowest Liquidity, Highest Risk Score, Volume).
  - Responsive table layout with mobile-first card fallback.
  - One-click mint address copy button with clipboard feedback.
- **Deep-Dive Detail Page (`/token/[mint]`)**:
  - Full RugCheck risk list with severity tags (`danger`, `warn`, `info`) and descriptions.
  - Authority status badges (Mint Authority & Freeze Authority).
  - LP lock percentage progress bar.
  - Top 10 holder concentration table with insider flags.
  - Direct links to DexScreener, RugCheck, and Solscan.
- **Methodology & Safety (`/about`)**:
  - Clear explanation of pipeline heuristics, zero-DB architecture, and legal disclaimers.

---

## 📁 File Structure

```text
SolRugWatch/
├── app/
│   ├── api/
│   │   ├── rugs/
│   │   │   └── route.ts            # Main /api/rugs pipeline endpoint with caching
│   │   └── token/
│   │       └── [mint]/
│   │           └── route.ts        # Single token detail telemetry endpoint
│   ├── about/
│   │   └── page.tsx                # Methodology, classification rules & safety copy
│   ├── token/
│   │   └── [mint]/
│   │       └── page.tsx            # Token in-depth analysis page
│   ├── globals.css                 # Dark theme, Solana gradients & custom scrollbars
│   ├── layout.tsx                  # Root layout with Navbar and Footer
│   └── page.tsx                    # Live dashboard with stat cards & token table
├── components/
│   ├── CountdownRefresh.tsx        # 60s countdown bar and manual refresh trigger
│   ├── CopyButton.tsx              # Clipboard copy button with checkmark feedback
│   ├── Footer.tsx                  # Footer with required legal & safety copy
│   ├── Navbar.tsx                  # Sticky header with branding and live status
│   ├── StatCard.tsx                # Animated metric card component
│   └── TokenTable.tsx              # Filterable, sortable, responsive token table
├── lib/
│   ├── cache.ts                    # In-memory TTL cache with stampede protection
│   ├── classify.ts                 # Classification engine (RUGGED vs HIGH_RISK)
│   ├── dexscreener.ts              # DexScreener discovery & batch enrichment
│   ├── geckoterminal.ts            # GeckoTerminal new pool candidate discovery
│   ├── rugcheck.ts                 # RugCheck API client with concurrency & retry
│   ├── scan.ts                     # Full server-side pipeline orchestrator
│   └── utils.ts                    # Formatting helpers (USD, percent, address, time)
├── types/
│   └── token.ts                    # Strict TypeScript interfaces and schemas
├── .env.example                    # Example environment configuration
├── .env.local                      # Local environment configuration
├── next.config.mjs                 # Next.js configuration (remote image domains)
├── package.json                    # Dependencies and scripts
├── postcss.config.mjs              # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration with Solana accents
└── tsconfig.json                   # Strict TypeScript compiler options & aliases
```

---

## 🚀 Setup & Local Development

### Prerequisites
- Node.js 18.17+ or Node.js 20+ (tested on Node v24)
- npm or pnpm or yarn

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Settings in `.env.local`:
```env
# Cache TTL in seconds (default: 300 = 5 minutes)
CACHE_TTL_SECONDS=300

# Optional: RugCheck API JWT token (for higher rate limits)
RUGCHECK_API_KEY=

# App base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔐 Authentication, Database & Subscriptions

Google sign-in/sign-up, database publishing, seed accounts, and the subscription
strategy are documented in **[`doc/auth-and-billing.md`](doc/auth-and-billing.md)**.

Quick reference:

```bash
npm run db:push     # publish prisma/schema.prisma to MySQL
npm run db:seed     # insert demo users (all plans) + example rows
npm run db:studio   # browse the database
```

Demo login: `demo@rugpulltool.dev` / `Demo1234!` (ADVANCED, lifetime).

Google OAuth needs `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`; the button is
hidden until both are set. Redirect URI:
`http://localhost:3001/api/auth/callback/google`.

### Solana Pay checkout

Paid plans are sold in SOL. Set a treasury address, then visit
`/checkout?plan=basic` (or pick a plan on the landing page):

```env
NEXT_PUBLIC_TREASURY_WALLET=<your Solana treasury address>
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

The flow creates a `payments` intent, shows a Solana Pay QR + in-browser wallet
button, verifies recipient/amount/reference on-chain, and activates the plan
server-side. Details: [`doc/auth-and-billing.md`](doc/auth-and-billing.md).

---

## 🚀 Launch Studio (`/launch`)

A wallet-signed pump.fun-style launch flow, additive to the radar.

**How it works**

1. The browser generates an ephemeral mint keypair — it never leaves the tab.
2. The image and metadata JSON are pinned to IPFS through `/api/upload` (Pinata JWT stays server-side).
3. `/api/launch` asks PumpPortal to assemble an unsigned `create` transaction for the `pump` or `bonk` venue.
4. The client signs with the mint keypair plus the connected wallet and broadcasts to `NEXT_PUBLIC_SOLANA_RPC_URL`.

**Why the liquidity cannot be pulled:** a bonding curve's liquidity is program-owned. There is no LP token, so there is no liquidity for a creator to withdraw. The remaining risk vector is a creator selling a dev allocation, which is why the pre-flight panel discloses the exact dev buy before signing.

**Required environment**

```env
PINATA_JWT=              # server-only, for image + metadata pinning
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

> Test the full flow on devnet with a dedicated launch build before broadcasting mainnet transactions. PumpPortal assembles mainnet instructions, so a devnet RPC is only useful for verifying wallet/signing UX, not a real launch.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. In **Project Settings**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
4. Add Environment Variables (optional):
   - `CACHE_TTL_SECONDS`: `300`
   - `RUGCHECK_API_KEY`: *(optional RugCheck JWT token)*
5. Click **Deploy**. Vercel will build the App Router project and serve the API routes and cached pages as Serverless Functions with Edge caching headers.

---

## 🔒 Reliability & Safety Architecture

- **No Client-Side Third-Party Calls**: Visitors interact exclusively with Next.js endpoints (`/api/rugs` and `/api/token/[mint]`). Upstream APIs are never queried directly from the browser.
- **Controlled Concurrency**: RugCheck requests are capped at 5 simultaneous requests with a 150ms delay between batches, avoiding 429 rate limit errors.
- **Thundering Herd Shield**: If a cache miss occurs while an automated scan is in progress, subsequent requests attach to the existing in-flight Promise rather than initiating redundant scans.
- **Resilient Fallback**: If an individual token request fails or times out (8s limit), it is skipped without crashing the rest of the scan.

---

## ⚖️ Legal & Safety Copy

> **Notice:** All classifications and metrics are automatically compiled from third-party data providers (DexScreener, GeckoTerminal, and RugCheck) and are strictly provided for informational purposes. They do not constitute financial, investment, or trading advice. Classifications are **"Flagged by RugCheck data"** and do not constitute accusations of malicious conduct or fraud. SolRugWatch never states that a project is a scam.

---

## 💡 Known Limitations & Suggested Next Steps

### Limitations
1. **No Persistent History**: Since there is no database, historical price charts or rug archives older than the current cache cycle are not retained.
2. **Discovery Scope**: Candidate discovery evaluates the top 40 freshest candidates from GeckoTerminal and DexScreener. Micro-cap tokens launched on unindexed bonding curves may take a few minutes to appear once liquidity pools are indexed.

### Suggested Next Steps
- **Solana RPC WebSocket Feed**: Add direct WebSocket listeners to Raydium and Pump.fun program logs for millisecond-level pool detection.
- **Export Capabilities**: Add a one-click CSV/JSON export button on the dashboard for security researchers and on-chain analysts.
- **Telegram / Discord Webhook Alerts**: Allow community operators to subscribe to instant alerts when a token triggers a `RUGGED` flag.
