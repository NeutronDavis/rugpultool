import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Wallet,
  Layers,
  Zap,
  Lock,
  LineChart,
  Terminal,
} from "lucide-react";

import { PartnerStrip, SolanaMark, VENUES } from "@/components/brand/PartnerMarks";

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function SectionHead({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow: string;
  title: string;
  copy?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/40">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-balance-tight">
          {title}
        </h2>
        {copy && (
          <p className="mt-3 text-sm leading-relaxed text-base-content/55">{copy}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function CheckRow({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] leading-relaxed text-base-content/65">
      <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-primary/15">
        <Check className="h-2.5 w-2.5 text-primary" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Features                                                            */
/* ------------------------------------------------------------------ */

export function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
      <SectionHead
        eyebrow="Launch features"
        title="Everything a memecoin needs, and nothing it shouldn't have"
        copy="The tool is built around one constraint: the liquidity that buyers fund must never be withdrawable by the creator."
      />

      <div className="mt-8 sm:mt-10 grid gap-4 lg:grid-cols-2">
        <div className="card card-border bg-base-200/50 h-full">
          <div className="card-body gap-4 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </span>
              <h3 className="card-title text-base">Launch studio</h3>
            </div>
            <p className="text-[13px] leading-relaxed text-base-content/50">
              Configure, pin, sign, live — in a single transaction. No dashboard, no devnet
              roulette, no twenty-step setup.
            </p>
            <ul className="space-y-2.5">
              <CheckRow>Bonding-curve launch on pump.fun or bonk.fun</CheckRow>
              <CheckRow>Metadata pinned to IPFS, not to our servers</CheckRow>
              <CheckRow>Mint and freeze authority never in creator hands</CheckRow>
              <CheckRow>Pre-flight panel shows your dev buy before you sign</CheckRow>
            </ul>
            <div className="mt-auto flex items-center justify-between border-t border-base-300 pt-4 text-[11px] text-base-content/40">
              <span>Average launch</span>
              <span className="font-mono text-base-content/70">1 signature · ~2s</span>
            </div>
          </div>
        </div>

        <div className="card card-border bg-base-200/50 h-full">
          <div className="card-body gap-4 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10">
                <LineChart className="h-4 w-4 text-primary" />
              </span>
              <h3 className="card-title text-base">Position manager</h3>
            </div>
            <p className="text-[13px] leading-relaxed text-base-content/50">
              Every balance in the connected wallet, priced from the deepest live pair, with a
              market exit that is as visible as it should be.
            </p>
            <ul className="space-y-2.5">
              <CheckRow>Live valuation across all SPL balances</CheckRow>
              <CheckRow>Partial exits at 25 / 50 / 100 percent</CheckRow>
              <CheckRow>Slippage and priority fee under your control</CheckRow>
              <CheckRow>Same RPC and signer as the launch flow</CheckRow>
            </ul>
            <div className="mt-auto space-y-2 border-t border-base-300 pt-4 text-[11px]">
              <div className="flex justify-between text-base-content/40">
                <span>Settlement</span>
                <span className="font-mono text-base-content/70">On-chain, T+0</span>
              </div>
              <div className="flex justify-between text-base-content/40">
                <span>Custody</span>
                <span className="font-mono text-base-content/70">Your wallet only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stack                                                               */
/* ------------------------------------------------------------------ */

const STACK = [
  {
    icon: Wallet,
    title: "Wallet-native signing",
    copy: "Mint keypairs are generated in the tab and discarded. No private key, seed phrase or delegated authority ever reaches our server.",
    metric: "0",
    unit: "keys held",
  },
  {
    icon: Layers,
    title: "Bonding-curve liquidity",
    copy: "The curve owns the SOL reserve. There is no LP token to hold, burn or withdraw, so the classic exit does not exist.",
    metric: "0",
    unit: "LP tokens",
  },
  {
    icon: Terminal,
    title: "Immutable metadata",
    copy: "Images and JSON are pinned to IPFS before the mint is created. The token cannot be de-listed by turning off our server.",
    metric: "IPFS",
    unit: "pinned",
  },
  {
    icon: ShieldCheck,
    title: "Risk telemetry",
    copy: "RugCheck, DexScreener and GeckoTerminal feed the radar so every launch is graded on arrival rather than after the fact.",
    metric: "3",
    unit: "data sources",
  },
];

export function StackSection() {
  return (
    <section id="stack" className="border-y border-base-300 bg-base-200/30">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <SectionHead
          eyebrow="Under the hood"
          title="Technology stack"
          copy="Four decisions that determine whether a launch can be rugged at all."
        />

        <div className="mt-8 sm:mt-10 divide-y divide-base-300 border-y border-base-300">
          {STACK.map(({ icon: Icon, title, copy, metric, unit }) => (
            <div
              key={title}
              className="grid gap-3 sm:gap-4 py-5 sm:py-7 grid-cols-1 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-8"
            >
              <div className="flex items-center gap-3 sm:block">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-base-300 bg-base-100 shrink-0">
                  <Icon className="h-4 w-4 text-base-content/60" />
                </span>
                <h3 className="text-sm font-semibold sm:hidden">{title}</h3>
              </div>
              <div>
                <h3 className="text-sm font-semibold hidden sm:block">{title}</h3>
                <p className="mt-1 sm:mt-1.5 max-w-2xl text-[13px] leading-relaxed text-base-content/50">
                  {copy}
                </p>
              </div>
              <div className="flex items-center justify-between sm:block sm:text-right pt-2 sm:pt-0 border-t border-base-300/40 sm:border-t-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight tabular-nums">
                  {metric}
                </div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-base-content/35">
                  {unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-base-content/35">
            Built on and integrated with
          </p>
          <div className="mt-4">
            <PartnerStrip labels />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works                                                        */
/* ------------------------------------------------------------------ */

const STEPS = [
  { title: "Connect a wallet", copy: "Phantom or Solflare. The app never asks for a seed phrase." },
  { title: "Describe the coin", copy: "Name, ticker, image and socials. Image is pinned to IPFS immediately." },
  { title: "Review pre-flight", copy: "Authorities, liquidity source and your dev buy are listed before signing." },
  { title: "Sign once", copy: "The mint keypair and wallet sign the same transaction. Nothing is batched behind your back." },
  { title: "It is live", copy: "DexScreener and RugCheck pick it up on their next index. Links appear on the result screen." },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
      <SectionHead
        eyebrow="How it works"
        title="Your Token Launch, Step by Step"
        copy="Five steps, one transaction, no intermediate custody of funds."
      />

      <div className="mt-8 sm:mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <ol className="space-y-0">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-3 sm:gap-4 border-l border-base-300 pb-6 sm:pb-7 last:pb-0 pl-4 sm:pl-5 relative">
              <span className="absolute -left-[13px] top-0 grid h-6 w-6 place-items-center rounded-full border border-base-300 bg-base-100 font-mono text-[10px] text-base-content/50">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="pt-0.5">
                <h3 className="text-sm font-medium">{step.title}</h3>
                <p className="mt-1 text-[13px] leading-relaxed text-base-content/50">{step.copy}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mockup-code border border-base-300 bg-black/60 text-[11px] sm:text-[12.5px] max-w-full overflow-x-auto shadow-lg">
          <pre data-prefix="$"><code className="text-base-content/50">rugpull launch --venue pump</code></pre>
          <pre data-prefix=">" className="text-success"><code>wallet connected        4xK2…9fQ</code></pre>
          <pre data-prefix=">" className="text-success"><code>image pinned            ipfs://bafy…7m2</code></pre>
          <pre data-prefix=">" className="text-success"><code>metadata pinned         ipfs://bafy…c41</code></pre>
          <pre data-prefix=">" className="text-success"><code>mint authority          program-held</code></pre>
          <pre data-prefix=">" className="text-success"><code>freeze authority        disabled</code></pre>
          <pre data-prefix=">" className="text-success"><code>lp token                none exists</code></pre>
          <pre data-prefix=">" className="text-warning"><code>awaiting signature…</code></pre>
          <pre data-prefix="$" className="text-primary"><code>live — dexscreener.com/solana/…</code></pre>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

export { Pricing } from "./Pricing";

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

const FAQS = [
  {
    q: "Can a creator pull liquidity on a coin launched here?",
    a: "No. Bonding-curve liquidity is held by the program, not by an LP token. There is no liquidity for a creator to withdraw, and the mint and freeze authorities are not in creator hands.",
  },
  {
    q: "So what can still go wrong?",
    a: "A creator can buy at launch and sell later. That is a dump, not a rug, but buyers experience it the same way. That is why the dev buy is disclosed in pre-flight and why we default it to zero.",
  },
  {
    q: "Who holds my keys?",
    a: "You do. The mint keypair is generated in your browser tab and discarded after signing. We never receive a seed phrase, private key or delegated authority.",
  },
  {
    q: "What happens if this site goes offline?",
    a: "Nothing to your token. Metadata is pinned to IPFS before the mint exists, so wallets and DexScreener keep resolving the name and image independently of us.",
  },
  {
    q: "Do you take a cut of launches?",
    a: "No launch fee and no share of creator revenue. You pay for the subscription, plus network and venue fees that go to Solana and the launch venue.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
      <SectionHead eyebrow="FAQ" title="Frequently asked questions" />

      <div className="mt-8 max-w-3xl divide-y divide-base-300 border-y border-base-300">
        {FAQS.map((item, index) => (
          <div key={item.q} className="collapse collapse-plus rounded-none">
            <input type="radio" name="landing-faq" defaultChecked={index === 0} />
            <div className="collapse-title px-0 text-sm font-medium">{item.q}</div>
            <div className="collapse-content px-0">
              <p className="pb-3 text-[13px] leading-relaxed text-base-content/55">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Coverage                                                            */
/* ------------------------------------------------------------------ */

const COVERAGE = [
  { name: "Phantom", note: "Wallet adapter", status: "Supported" },
  { name: "Solflare", note: "Wallet adapter", status: "Supported" },
  { name: "pump.fun", note: "Launch + curve exit", status: "Supported" },
  { name: "bonk.fun", note: "Launch + curve exit", status: "Supported" },
  { name: "DexScreener", note: "Pricing and discovery", status: "Read-only" },
  { name: "RugCheck", note: "Risk telemetry", status: "Read-only" },
  { name: "Backpack", note: "Wallet adapter", status: "Roadmap" },
];

const STATUS_CLASS: Record<string, string> = {
  Supported: "badge-success badge-soft",
  "Read-only": "badge-warning badge-soft",
  Roadmap: "badge-ghost",
};

export function Compatibility() {
  return (
    <section id="coverage" className="border-y border-base-300 bg-base-200/30">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
        <SectionHead
          eyebrow="Coverage"
          title="Platform compatibility"
          copy="What the tool talks to, and how much authority it has over each one."
        />

        <div className="mt-8 overflow-x-auto rounded-box border border-base-300">
          <table className="table table-sm">
            <thead>
              <tr className="border-base-300 text-[11px] uppercase tracking-[0.14em] text-base-content/40">
                <th>Platform</th>
                <th>Integration</th>
                <th className="text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {COVERAGE.map((row) => (
                <tr key={row.name} className="border-base-300/70">
                  <td className="font-medium">{row.name}</td>
                  <td className="text-base-content/45">{row.note}</td>
                  <td className="text-right">
                    <span className={`badge badge-sm ${STATUS_CLASS[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["2", "launch venues"],
            ["3", "data sources"],
            ["<60s", "radar refresh"],
            ["0", "LP tokens to pull"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-box border border-base-300 bg-base-100 p-4">
              <div className="text-2xl font-semibold tabular-nums">{value}</div>
              <div className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-base-content/35">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Closing CTA                                                         */
/* ------------------------------------------------------------------ */

export function ClosingCta() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-24">
      <div className="relative overflow-hidden rounded-2xl border border-base-300 bg-hairline-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="relative px-4 py-10 text-center sm:px-12 sm:py-20">
          <div className="mx-auto flex max-w-xl flex-col items-center">
            <span className="badge badge-outline badge-sm gap-1.5 border-primary/40 text-primary">
              <SolanaMark className="h-3 w-3" />
              Solana mainnet
            </span>
            <h2 className="mt-5 text-2xl sm:text-4xl font-semibold tracking-tight text-balance-tight">
              Ready to launch something that cannot be pulled?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-base-content/55">
              Connect a wallet, describe the coin, sign once. The rest is program-owned.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row w-full sm:w-auto">
              <Link href="/launch" className="btn btn-primary w-full sm:w-auto">
                Open launch studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="btn btn-outline w-full sm:w-auto">
                View the radar
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-[11px] text-base-content/35">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> No custody
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3" /> Authorities revoked
              </span>
              <span className="flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Immutable metadata
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
