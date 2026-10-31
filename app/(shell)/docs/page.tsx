import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  HelpCircle,
  KeyRound,
  Layers,
  Lock,
  Rocket,
  Search,
  ShieldAlert,
  Wallet,
} from "lucide-react";

export const metadata: Metadata = {
  title: "User guide — rugpulltool",
  description:
    "How to use the rugpulltool risk radar, Launch Studio, Positions, accounts and Solana Pay subscriptions.",
};

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "quick-start", label: "Quick start" },
  { id: "radar", label: "Risk radar" },
  { id: "token-detail", label: "Token detail" },
  { id: "launch", label: "Launch Studio" },
  { id: "positions", label: "Positions" },
  { id: "account", label: "Accounts & sign-in" },
  { id: "plans", label: "Plans & billing" },
  { id: "troubleshooting", label: "Troubleshooting" },
  { id: "safety", label: "Safety & limits" },
  { id: "support", label: "Support" },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl py-2 sm:py-4">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <BookOpen className="h-3.5 w-3.5" />
          <span>User guide</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-4xl">
          Everything you need to use rugpulltool
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-base-content/60 sm:text-base">
          This guide walks through the free risk radar, the paid Launch Studio, position
          management, accounts and Solana Pay subscriptions. It assumes no prior Solana
          experience — but it does assume you understand that memecoins are extremely risky.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
          <Link href="/dashboard" className="btn btn-outline btn-xs gap-1.5">
            <Activity className="h-3 w-3" />
            Open the radar
          </Link>
          <Link href="/#pricing" className="btn btn-primary btn-xs gap-1.5">
            <CreditCard className="h-3 w-3" />
            View plans
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <details className="card card-border bg-base-200/50 p-4 lg:hidden">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">
              Contents
            </summary>
            <TocList className="mt-3" />
          </details>
          <nav className="hidden lg:block">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/35">
              Contents
            </p>
            <TocList />
          </nav>
        </aside>

        <article className="min-w-0 space-y-10 sm:space-y-12">
          <Section id="overview" icon={<Layers className="h-5 w-5 text-primary" />} title="Overview">
            <p>
              rugpulltool has two halves. The <strong>risk radar</strong> is free and open to
              everyone: it discovers freshly launched Solana memecoins and flags structural
              problems. The <strong>launch toolkit</strong> is paid: it lets you create a token on
              a bonding curve and manage the positions in your wallet.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Card
                title="Free — risk radar"
                icon={<Activity className="h-4 w-4 text-success" />}
                points={[
                  "Live discovery of new Solana pools",
                  "Rugged / high-risk classification",
                  "Search, filters and token deep-dives",
                  "No wallet or account required",
                ]}
              />
              <Card
                title="Paid — launch toolkit"
                icon={<Rocket className="h-4 w-4 text-primary" />}
                points={[
                  "Launch on pump.fun or bonk.fun curves",
                  "IPFS image + metadata pinning",
                  "Wallet position dashboard",
                  "Sell into the bonding curve",
                ]}
              />
            </div>
            <Note tone="info">
              rugpulltool is <strong>non-custodial</strong>. We never hold your funds, private keys
              or seed phrase. Every transaction is built for your wallet to sign in your browser.
            </Note>
          </Section>

          <Section
            id="quick-start"
            icon={<Rocket className="h-5 w-5 text-primary" />}
            title="Quick start"
          >
            <p className="text-sm text-base-content/60">
              The full path from visitor to first launch takes about five minutes plus wallet
              signing time.
            </p>
            <ol className="space-y-4">
              <Step n="1" title="Create an account">
                Open <Link href="/login" className="link link-primary">Sign in</Link> and choose{" "}
                <strong>Continue with Google</strong> or create an email/password account. Google
                and email accounts with the same address are linked automatically.
              </Step>
              <Step n="2" title="Choose a plan (only if you want to launch)">
                The radar is free. Launch Studio and Positions require a paid package. Pick one on{" "}
                <Link href="/#pricing" className="link link-primary">Pricing</Link>; you will be sent
                to checkout.
              </Step>
              <Step n="3" title="Pay in SOL">
                Scan the Solana Pay QR with Phantom, Solflare or any Solana Pay wallet, or connect a
                wallet and press <strong>Pay</strong>. Access unlocks as soon as the transfer is
                confirmed on-chain.
              </Step>
              <Step n="4" title="Connect your wallet">
                Use the wallet button in the top-right corner. Phantom and Solflare are supported.
                Your wallet address is public; your keys never leave the extension.
              </Step>
              <Step n="5" title="Launch or manage positions">
                Go to <Link href="/launch" className="link link-primary">Launch Studio</Link> to
                create a token, or{" "}
                <Link href="/portfolio" className="link link-primary">Positions</Link> to inspect
                and sell what your wallet holds.
              </Step>
            </ol>
          </Section>

          <Section
            id="radar"
            icon={<Activity className="h-5 w-5 text-success" />}
            title="Risk radar"
          >
            <p>
              The radar lives at <Link href="/dashboard" className="link link-primary">/dashboard</Link>{" "}
              and is public. It combines discovery data from GeckoTerminal and DexScreener with
              risk telemetry from RugCheck.
            </p>
            <SubTitle>What you see</SubTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>
                <strong>Stat cards</strong> — rugged count, high-risk count, tokens scanned and
                cache age.
              </li>
              <li>
                <strong>Filter tabs</strong> — All, Rugged and High Risk.
              </li>
              <li>
                <strong>Search</strong> — name, symbol or mint address.
              </li>
              <li>
                <strong>Sorting</strong> — newest, lowest liquidity, highest risk score or volume.
              </li>
              <li>
                <strong>Auto-refresh</strong> — every 60 seconds, with a countdown and a manual
                refresh button.
              </li>
            </ul>
            <SubTitle>Classification</SubTitle>
            <div className="space-y-3">
              <RiskRow
                tone="error"
                label="RUGGED"
                text="RugCheck explicitly flags the token as rugged, or liquidity has collapsed below $1,000 while the risk score stays high."
              />
              <RiskRow
                tone="warning"
                label="HIGH RISK"
                text="Not rugged yet, but structurally dangerous: active mint or freeze authority, unlocked LP (under 50%), or one holder above 50% of supply."
              />
            </div>
            <Note tone="warning">
              Flags are heuristic indicators from third-party data — not accusations of fraud and
              not investment advice. A token without a flag can still go to zero.
            </Note>
          </Section>

          <Section
            id="token-detail"
            icon={<Search className="h-5 w-5 text-primary" />}
            title="Token detail"
          >
            <p>
              Click any row to open <code className="rounded bg-base-300/60 px-1.5 py-0.5 text-[11px]">/token/&lt;mint&gt;</code>.
              The detail page shows:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>Full RugCheck risk list with danger / warning / info severity.</li>
              <li>Mint authority and freeze authority status.</li>
              <li>LP lock percentage.</li>
              <li>Top 10 holders with insider flags.</li>
              <li>Direct links to DexScreener, RugCheck and Solscan.</li>
            </ul>
            <p className="text-sm text-base-content/60">
              Use the copy button next to the mint to paste the contract into your wallet or a
              block explorer before trading.
            </p>
          </Section>

          <Section
            id="launch"
            icon={<Rocket className="h-5 w-5 text-primary" />}
            title="Launch Studio"
          >
            <p>
              Launch Studio creates a token on a bonding curve (pump.fun or bonk.fun). A bonding
              curve&apos;s liquidity is owned by the program, so there is no LP token for the
              creator to withdraw — the classic rug vector is removed. The remaining risk is the
              creator&apos;s dev buy, which is disclosed before you sign.
            </p>

            <SubTitle>Before you start</SubTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>A paid plan and a signed-in account.</li>
              <li>A Solana wallet with SOL for the dev buy, network fee and priority fee.</li>
              <li>A token name (max 32 characters) and symbol (1–10 letters/digits).</li>
              <li>An image: PNG, JPG, WEBP or GIF, max 5 MB.</li>
              <li>Optional socials: X/Twitter, Telegram and website URLs.</li>
            </ul>

            <SubTitle>Step by step</SubTitle>
            <ol className="space-y-4">
              <Step n="1" title="Fill in the token details">
                Name, symbol, description, image and socials. The image is pinned to IPFS through
                our server; the Pinata credential never reaches the browser.
              </Step>
              <Step n="2" title="Set the dev buy">
                This is the amount of SOL you buy at launch. It becomes your opening position and
                is shown in the pre-flight panel. Set it to 0 if you do not want an allocation.
              </Step>
              <Step n="3" title="Choose slippage and priority fee">
                Slippage defaults to 15%. Priority fee defaults to 0.00005 SOL; raise it if the
                network is congested.
              </Step>
              <Step n="4" title="Pick a venue">
                <strong>pump.fun</strong> or <strong>bonk.fun</strong>. The venue decides which
                curve your token launches on.
              </Step>
              <Step n="5" title="Review pre-flight">
                Check liquidity, LP token, mint authority and dev buy. If anything looks wrong,
                change it before signing.
              </Step>
              <Step n="6" title="Sign in your wallet">
                The browser generates a throwaway mint keypair, receives an unsigned transaction
                from the launch builder, signs with both keys and broadcasts to the configured RPC.
              </Step>
            </ol>

            <SubTitle>What it costs</SubTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>Your dev buy (goes into the curve, not to us).</li>
              <li>Solana network fee per transaction.</li>
              <li>Priority fee (optional but recommended).</li>
              <li>The package price you already paid.</li>
            </ul>

            <Note tone="warning">
              Launching a token does not make it valuable. Most memecoins go to zero. Start with a
              small dev buy, and never spend more than you can lose.
            </Note>
          </Section>

          <Section
            id="positions"
            icon={<Wallet className="h-5 w-5 text-primary" />}
            title="Positions"
          >
            <p>
              <Link href="/portfolio" className="link link-primary">Positions</Link> lists every SPL
              token balance in the connected wallet and prices it from the deepest live pair. You
              can sell into the bonding curve from the same page.
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>Connect a wallet to load balances; disconnect to hide them.</li>
              <li>Set slippage before selling. Default is 15%.</li>
              <li>The transaction is built server-side and signed in your wallet.</li>
              <li>Refresh to re-read balances after a trade.</li>
            </ul>
            <Note tone="info">
              Selling is public. Your position and exit are visible on-chain the moment the
              transaction lands, whether or not you use this page. Selling into a thin curve moves
              the price against you.
            </Note>
          </Section>

          <Section
            id="account"
            icon={<KeyRound className="h-5 w-5 text-primary" />}
            title="Accounts & sign-in"
          >
            <SubTitle>Sign-in options</SubTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>
                <strong>Google</strong> — one click, no password. If Google is not configured on a
                deployment, the button is hidden and email/password is used instead.
              </li>
              <li>
                <strong>Email &amp; password</strong> — minimum 8 characters. Passwords are stored
                as bcrypt hashes, never in plain text.
              </li>
            </ul>
            <SubTitle>Account linking</SubTitle>
            <p className="text-sm text-base-content/60">
              If you sign up with email and later use Google with the same address, both land on
              the same account. Only do this with an email you control.
            </p>
            <SubTitle>Sessions and plan refresh</SubTitle>
            <p className="text-sm text-base-content/60">
              Sessions use signed JWT cookies. Your plan is re-read from the database on each
              session refresh, so a confirmed upgrade normally appears after a page refresh. If it
              does not, sign out and back in.
            </p>
            <SubTitle>Deleting your account</SubTitle>
            <p className="text-sm text-base-content/60">
              There is no self-serve delete button yet. Email{" "}
              <a href="mailto:support@rugpulltool.dev" className="link link-primary">
                support@rugpulltool.dev
              </a>{" "}
              from the address on the account and we will remove it. See the{" "}
              <Link href="/terms#privacy" className="link link-primary">Privacy Policy</Link>.
            </p>
          </Section>

          <Section
            id="plans"
            icon={<CreditCard className="h-5 w-5 text-primary" />}
            title="Plans & billing"
          >
            <SubTitle>Packages</SubTitle>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>Access</th>
                    <th>Best for</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-medium">Free</td>
                    <td>0 SOL</td>
                    <td>Risk radar only</td>
                    <td>Trying the radar</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Tester</td>
                    <td>2.8 SOL</td>
                    <td>7 days</td>
                    <td>A single trial launch</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Basic</td>
                    <td>4.9 SOL</td>
                    <td>Lifetime</td>
                    <td>Occasional launches</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Advanced</td>
                    <td>7.7 SOL</td>
                    <td>Lifetime</td>
                    <td>Repeat launchers</td>
                  </tr>
                  <tr>
                    <td className="font-medium">Premium</td>
                    <td>9.8 SOL</td>
                    <td>Lifetime</td>
                    <td>Full marketing package</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <SubTitle>How checkout works</SubTitle>
            <ol className="space-y-4">
              <Step n="1" title="Pick a plan">
                Pricing links carry the plan through sign-in, so you land on checkout with the right
                package selected.
              </Step>
              <Step n="2" title="Pay from a QR or a connected wallet">
                The checkout page shows a Solana Pay QR and a <strong>Pay</strong> button. Either
                path sends the exact amount to the treasury wallet with a one-time reference.
              </Step>
              <Step n="3" title="Wait for confirmation">
                The page checks the chain every few seconds. A confirmed transfer unlocks the plan
                automatically — you do not need to email anyone.
              </Step>
            </ol>

            <SubTitle>Rules that protect you</SubTitle>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>Each payment request expires after 20 minutes; create a new one if it lapses.</li>
              <li>The amount and recipient are fixed by the server, not by the browser.</li>
              <li>A transaction can only be claimed once; reusing a signature is rejected.</li>
              <li>Buying a lower tier never downgrades a live higher tier.</li>
              <li>Buying Tester again extends the existing expiry by 7 days.</li>
            </ul>

            <SubTitle>Refunds and network fees</SubTitle>
            <p className="text-sm text-base-content/60">
              Solana transfers are final and cannot be reversed. Network and priority fees are
              separate from the package price. If a payment was sent but the plan did not activate,
              contact support with the transaction signature before paying again.
            </p>
          </Section>

          <Section
            id="troubleshooting"
            icon={<HelpCircle className="h-5 w-5 text-primary" />}
            title="Troubleshooting"
          >
            <div className="space-y-3">
              <Faq q="The Google button is missing">
                That deployment has no Google OAuth credentials configured. Use email/password, or
                ask the operator to add <code>GOOGLE_CLIENT_ID</code> and{" "}
                <code>GOOGLE_CLIENT_SECRET</code>.
              </Faq>
              <Faq q="I paid but still see “Subscription required”">
                Wait for the transaction to confirm, then refresh. Check that the transfer went to
                the treasury address shown at checkout and that the amount matched. If it still
                fails, send the signature to support — do not pay twice.
              </Faq>
              <Faq q="My payment request expired">
                Intents last 20 minutes. Press <strong>New payment request</strong> and pay the
                fresh QR.
              </Faq>
              <Faq q="My wallet will not connect">
                Unlock the extension, refresh the page, and make sure Phantom or Solflare is on
                mainnet. A hardware wallet can be used through the extension.
              </Faq>
              <Faq q="The launch transaction failed">
                Common causes: not enough SOL for the dev buy plus fees, a congested RPC, or an
                image over 5 MB. Raise the priority fee and retry.
              </Faq>
              <Faq q="The token does not appear on the radar">
                Discovery is not instant. A brand-new curve may take a few minutes to be indexed by
                GeckoTerminal or DexScreener, and the radar only scans the freshest candidates.
              </Faq>
              <Faq q="I forgot my password">
                Use Google with the same email if it is linked, or email support from that address
                to recover access. Password reset email is not available yet.
              </Faq>
            </div>
          </Section>

          <Section
            id="safety"
            icon={<ShieldAlert className="h-5 w-5 text-error" />}
            title="Safety & limits"
          >
            <Note tone="warning">
              Memecoins are highly volatile and most go to zero. Nothing on rugpulltool is
              financial, investment, legal or trading advice. Third-party data can be delayed or
              wrong. Every on-chain action is irreversible.
            </Note>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-base-content/60">
              <li>Never share your seed phrase or private key. Support will never ask for it.</li>
              <li>Verify the mint address on Solscan before buying or selling.</li>
              <li>The radar scans a limited set of fresh candidates, not the whole market.</li>
              <li>Classifications are heuristic flags, not proof of intent or fraud.</li>
              <li>Launching a token does not guarantee liquidity, demand or value.</li>
            </ul>
            <p className="text-sm text-base-content/60">
              Read the full <Link href="/terms#terms" className="link link-primary">Terms of Service</Link>{" "}
              and <Link href="/terms#privacy" className="link link-primary">Privacy Policy</Link>.
            </p>
          </Section>

          <Section
            id="support"
            icon={<ExternalLink className="h-5 w-5 text-primary" />}
            title="Support"
          >
            <p className="text-sm text-base-content/60">
              For account, billing or launch issues, email{" "}
              <a href="mailto:support@rugpulltool.dev" className="link link-primary">
                support@rugpulltool.dev
              </a>{" "}
              with your account email and, for payments, the transaction signature. Never send a
              seed phrase or private key.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard" className="btn btn-outline btn-sm gap-1.5">
                Risk radar
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link href="/#pricing" className="btn btn-primary btn-sm gap-1.5">
                Plans &amp; pricing
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Section>

          <div className="border-t border-base-300 pt-6 text-[11px] text-base-content/35">
            Last updated: 1 November 2026 · This guide is informational and may change as the
            product evolves.
          </div>
        </article>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small presentation helpers                                          */
/* ------------------------------------------------------------------ */

function TocList({ className = "" }: { className?: string }) {
  return (
    <ul className={`space-y-1 text-[12.5px] ${className}`}>
      {TOC.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="block rounded-md px-2 py-1 text-base-content/50 transition-colors hover:bg-base-300/50 hover:text-base-content"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

function Section({
  id,
  title,
  icon,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-base-content sm:text-xl">
        {icon}
        <span>{title}</span>
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-base-content/60">{children}</div>
    </section>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="pt-1 text-[13px] font-semibold uppercase tracking-[0.1em] text-base-content/45">
      {children}
    </h3>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary ring-1 ring-primary/25">
        {n}
      </span>
      <div>
        <p className="text-[13.5px] font-semibold text-base-content/85">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-base-content/55">{children}</p>
      </div>
    </li>
  );
}

function Card({
  title,
  icon,
  points,
}: {
  title: string;
  icon: React.ReactNode;
  points: string[];
}) {
  return (
    <div className="card card-border bg-base-200/50 p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-base-content/85">
        {icon}
        {title}
      </p>
      <ul className="mt-2 space-y-1 text-[12px] text-base-content/55">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-1.5">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Note({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning";
  children: React.ReactNode;
}) {
  const isWarning = tone === "warning";
  return (
    <div
      className={`flex gap-2 rounded-lg border p-3 text-[12.5px] leading-relaxed ${
        isWarning
          ? "border-warning/30 bg-warning/10 text-base-content/70"
          : "border-primary/25 bg-primary/5 text-base-content/65"
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      ) : (
        <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      )}
      <div>{children}</div>
    </div>
  );
}

function RiskRow({
  tone,
  label,
  text,
}: {
  tone: "error" | "warning";
  label: string;
  text: string;
}) {
  const isError = tone === "error";
  return (
    <div
      className={`rounded-lg border p-3 ${
        isError ? "border-error/25 bg-error/10" : "border-warning/25 bg-warning/10"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`badge badge-sm font-bold ${isError ? "badge-error" : "badge-warning"}`}>
          {label}
        </span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-base-content/60">{text}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group card card-border bg-base-200/40 p-3.5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[13px] font-medium text-base-content/80">
        <span>{q}</span>
        <Clock className="h-3.5 w-3.5 shrink-0 text-base-content/30 transition-transform group-open:rotate-90" />
      </summary>
      <div className="mt-2 text-[12.5px] leading-relaxed text-base-content/55">{children}</div>
    </details>
  );
}
