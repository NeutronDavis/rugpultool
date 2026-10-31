import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, FileText, Lock, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Privacy — rugpulltool",
  description:
    "The terms of service, risk notice and privacy policy that govern use of rugpulltool.",
};

const TERMS_TOC = [
  { id: "risk", label: "Risk notice" },
  { id: "acceptance", label: "Acceptance" },
  { id: "eligibility", label: "Eligibility" },
  { id: "accounts", label: "Accounts" },
  { id: "acceptable-use", label: "Acceptable use" },
  { id: "no-advice", label: "No financial advice" },
  { id: "launches", label: "Token launches" },
  { id: "payments", label: "Payments & plans" },
  { id: "third-party", label: "Third-party services" },
  { id: "ip", label: "Intellectual property" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes" },
  { id: "law", label: "Governing law" },
];

const PRIVACY_TOC = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "data-collection", label: "What we collect" },
  { id: "data-use", label: "How we use it" },
  { id: "data-sharing", label: "Sharing" },
  { id: "cookies", label: "Cookies" },
  { id: "retention", label: "Retention" },
  { id: "security", label: "Security" },
  { id: "rights", label: "Your rights" },
  { id: "children", label: "Children" },
  { id: "transfers", label: "International transfers" },
  { id: "privacy-changes", label: "Privacy changes" },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl py-2 sm:py-4">
      <div id="terms" className="scroll-mt-24">
        <Link
          href="/"
          className="btn btn-ghost btn-xs gap-1.5 border border-base-300 text-base-content/70"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to radar
        </Link>

        <div className="mt-5 mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <FileText className="h-3.5 w-3.5" />
          Legal
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-base-content sm:text-4xl">
          Terms of Service &amp; Privacy Policy
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-base-content/60 sm:text-base">
          These terms govern your use of rugpulltool. By creating an account, paying for a plan or
          using the radar, you agree to them. Please read the risk notice first — memecoins are
          extremely volatile and most go to zero.
        </p>
        <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-base-content/35">
          Last updated: 1 November 2026
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <details className="card card-border bg-base-200/50 p-4 lg:hidden">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.12em] text-base-content/50">
              Contents
            </summary>
            <TocList items={[...TERMS_TOC, ...PRIVACY_TOC]} className="mt-3" />
          </details>
          <nav className="hidden space-y-5 lg:block">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/35">
                Terms of Service
              </p>
              <TocList items={TERMS_TOC} />
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/35">
                Privacy
              </p>
              <TocList items={PRIVACY_TOC} />
            </div>
          </nav>
        </aside>

        <article className="min-w-0 space-y-8 text-sm leading-relaxed text-base-content/60">
          <section id="risk" className="scroll-mt-24">
            <div className="alert alert-warning alert-soft items-start gap-3 p-4 text-[13px] leading-relaxed">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-bold text-base-content/85">Risk notice</p>
                <p className="mt-1 text-base-content/70">
                  Memecoins are highly volatile and most lose all or nearly all of their value.
                  Nothing on rugpulltool is financial, investment, legal, tax or trading advice.
                  Risk flags are heuristic indicators compiled from third-party data, not
                  accusations of fraud. You are solely responsible for every transaction you sign.
                  Never invest more than you can afford to lose.
                </p>
              </div>
            </div>
          </section>

          <LegalSection id="acceptance" title="1. Acceptance of these terms">
            <p>
              By accessing or using rugpulltool (the “Service”), creating an account, connecting a
              wallet, launching a token or paying for a plan, you agree to these Terms of Service
              and our Privacy Policy. If you do not agree, do not use the Service.
            </p>
          </LegalSection>

          <LegalSection id="eligibility" title="2. Eligibility">
            <p>
              You must be at least 18 years old (or the age of majority where you live) and legally
              able to enter into a binding contract. You must not be located in, or a resident of, a
              jurisdiction where using the Service or launching a token would be unlawful, or be
              subject to sanctions that prohibit your use.
            </p>
          </LegalSection>

          <LegalSection id="accounts" title="3. Accounts">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Provide accurate information and keep it up to date.</li>
              <li>Keep your login credentials secure and do not share your account.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>
                We may suspend or terminate accounts that violate these terms, abuse the Service,
                or create legal or security risk.
              </li>
            </ul>
          </LegalSection>

          <LegalSection id="acceptable-use" title="4. Acceptable use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Use the Service for fraud, market manipulation, wash trading or any illegal act.</li>
              <li>Impersonate another person, project or brand.</li>
              <li>Upload content that infringes intellectual property, is unlawful, or is harmful.</li>
              <li>Bypass paywalls, rate limits or access controls, or scrape the Service at scale.</li>
              <li>Interfere with the Service, its infrastructure or other users.</li>
              <li>Use the Service to launder money or evade sanctions.</li>
            </ul>
          </LegalSection>

          <LegalSection id="no-advice" title="5. No financial or legal advice">
            <p>
              The Service provides tooling and third-party data for informational purposes only. It
              is not a broker, exchange, investment adviser, custodian or fiduciary. Risk scores,
              classifications, prices, liquidity figures and holder data may be delayed, incomplete
              or wrong. Always verify a token contract independently before interacting with it.
            </p>
          </LegalSection>

          <LegalSection id="launches" title="6. Token launches">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                You are the sole issuer and operator of any token you launch. You are responsible
                for its metadata, marketing, disclosures and legal compliance.
              </li>
              <li>
                rugpulltool does not endorse, guarantee or take ownership of any token, and does not
                provide liquidity or make a market.
              </li>
              <li>
                Bonding-curve mechanics are controlled by third-party programs. We do not control
                pricing, demand, trading availability or the ability to sell.
              </li>
              <li>
                Your dev buy is disclosed in the pre-flight panel and is your own position. Selling
                it can move the price against holders.
              </li>
              <li>
                You must not use the Service to mislead buyers, including through false claims about
                liquidity, ownership or safety.
              </li>
            </ul>
          </LegalSection>

          <LegalSection id="payments" title="7. Payments, plans and subscriptions">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Plans are priced in SOL and paid on Solana mainnet to the treasury address shown at checkout.</li>
              <li>Blockchain transfers are final and cannot be reversed or charged back.</li>
              <li>
                A payment unlocks the plan after on-chain verification. Tester access lasts 7 days;
                Basic, Advanced and Premium are lifetime unless stated otherwise at purchase.
              </li>
              <li>
                Buying a lower tier does not downgrade a live higher tier. Buying Tester again
                extends an active Tester expiry by 7 days.
              </li>
              <li>Network and priority fees are separate and are not paid to us.</li>
              <li>Prices may change for future purchases; changes do not affect completed purchases.</li>
              <li>
                If a payment is confirmed but access is not granted, contact support with the
                transaction signature before paying again.
              </li>
              <li>You are responsible for any taxes that apply to your purchases or token activity.</li>
            </ul>
          </LegalSection>

          <LegalSection id="third-party" title="8. Third-party services">
            <p>
              The Service relies on third parties including Google (sign-in), Aiven (database
              hosting), Solana RPC providers, DexScreener, GeckoTerminal, RugCheck, Pinata/IPFS
              (metadata storage) and PumpPortal (transaction building). Their availability, accuracy
              and terms are outside our control. Your use of those services may be subject to their
              own agreements.
            </p>
          </LegalSection>

          <LegalSection id="ip" title="9. Intellectual property">
            <p>
              The Service, including its design, code, copy and branding, is owned by the operator
              or its licensors and is protected by intellectual property laws. We grant you a
              limited, non-exclusive, non-transferable licence to use the Service for its intended
              purpose.
            </p>
            <p>
              You retain ownership of content you upload (such as token images and metadata). By
              uploading it, you grant us a licence to store, process and publish it as needed to
              provide the Service — including pinning it to public IPFS, where it may be permanent
              and publicly accessible. You confirm you have the rights to that content.
            </p>
          </LegalSection>

          <LegalSection id="disclaimers" title="10. Disclaimers">
            <p>
              The Service is provided “as is” and “as available”, without warranties of any kind,
              express or implied, including merchantability, fitness for a particular purpose,
              non-infringement, accuracy or uninterrupted availability. We do not warrant that the
              Service will be error-free, secure or that any data is correct.
            </p>
          </LegalSection>

          <LegalSection id="liability" title="11. Limitation of liability">
            <p>
              To the maximum extent permitted by law, the operator is not liable for indirect,
              incidental, special, consequential or punitive damages, or for lost profits, lost
              tokens, lost data or loss of goodwill, arising from your use of the Service. Our total
              liability for any claim is limited to the greater of the amount you paid us in the 12
              months before the claim or 100 USD.
            </p>
            <p>
              Some jurisdictions do not allow certain limitations, so parts of this section may not
              apply to you.
            </p>
          </LegalSection>

          <LegalSection id="termination" title="12. Termination">
            <p>
              You may stop using the Service at any time. We may suspend or terminate access if you
              breach these terms, if required by law, or to protect the Service or other users.
              Sections that by their nature should survive termination — including payments,
              disclaimers, liability and governing law — will survive.
            </p>
          </LegalSection>

          <LegalSection id="changes" title="13. Changes to these terms">
            <p>
              We may update these terms from time to time. Material changes will be reflected by the
              “Last updated” date on this page. Continued use after an update means you accept the
              revised terms. If you do not agree, stop using the Service.
            </p>
          </LegalSection>

          <LegalSection id="law" title="14. Governing law">
            <p>
              These terms are governed by the laws of the jurisdiction in which the operator is
              established, without regard to conflict-of-law rules. Disputes will be handled by the
              courts of that jurisdiction, unless mandatory local law gives you a different right.
            </p>
          </LegalSection>

          {/* ------------------------------------------------------------------ */}
          {/* Privacy                                                             */}
          {/* ------------------------------------------------------------------ */}

          <div className="border-t border-base-300 pt-8">
            <section id="privacy" className="scroll-mt-24 space-y-4">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-base-content">
                <Lock className="h-5 w-5 text-primary" />
                Privacy Policy
              </h2>
              <p>
                This policy explains what rugpulltool collects, why, and the choices you have. It
                applies to the website, accounts, payments and the launch toolkit.
              </p>
            </section>
          </div>

          <LegalSection id="data-collection" title="What we collect">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Account data</strong> — email address, display name, profile image and the
                sign-in provider (Google or email/password). Passwords are stored only as bcrypt
                hashes.
              </li>
              <li>
                <strong>Plan and payment data</strong> — plan, amount, payment reference, status,
                timestamps and the public Solana transaction signature.
              </li>
              <li>
                <strong>Public wallet address</strong> — when you connect a wallet or complete a
                payment. It is public on-chain by design.
              </li>
              <li>
                <strong>Launch content</strong> — token name, symbol, description, image and social
                links you submit.
              </li>
              <li>
                <strong>Technical data</strong> — IP address, browser user agent, timestamps and
                request logs generated by our hosting and database providers.
              </li>
            </ul>
            <p>
              We do <strong>not</strong> collect or store private keys or seed phrases. Wallet
              signing happens inside your wallet extension, not on our servers.
            </p>
          </LegalSection>

          <LegalSection id="data-use" title="How we use data">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To create and secure your account and keep you signed in.</li>
              <li>To process payments and activate the plan you bought.</li>
              <li>To operate the radar, Launch Studio and Positions.</li>
              <li>To pin token images and metadata to IPFS at your request.</li>
              <li>To provide support and respond to requests.</li>
              <li>To detect abuse, fraud and security incidents.</li>
              <li>To comply with legal obligations and enforce our terms.</li>
            </ul>
            <p>
              Where applicable, we rely on contract performance (providing the Service), legitimate
              interests (security, improvement), consent (where required) and legal obligation.
            </p>
          </LegalSection>

          <LegalSection id="data-sharing" title="How we share data">
            <p>We share data only as needed to run the Service:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong>Google</strong> — for OAuth sign-in. Google receives the standard OAuth
                request and returns your email, name and profile image.
              </li>
              <li>
                <strong>Aiven</strong> — hosts the MySQL database that stores accounts and payment
                records.
              </li>
              <li>
                <strong>Hosting and RPC providers</strong> — serve the app and broadcast or verify
                Solana transactions.
              </li>
              <li>
                <strong>Pinata / IPFS</strong> — stores token images and metadata publicly when you
                launch.
              </li>
              <li>
                <strong>PumpPortal</strong> — builds launch and sell transactions from the details
                you submit.
              </li>
              <li>
                <strong>Data providers</strong> — DexScreener, GeckoTerminal and RugCheck receive
                token mint addresses when the radar queries them.
              </li>
            </ul>
            <p>
              We do not sell personal data. We may disclose data if required by law or to protect
              rights, safety and the Service.
            </p>
          </LegalSection>

          <LegalSection id="cookies" title="Cookies and local storage">
            <p>
              We use essential cookies only: a signed session cookie from NextAuth and a CSRF token.
              They keep you signed in and protect form submissions. We do not use advertising
              cookies or third-party trackers. Blocking these cookies may prevent sign-in.
            </p>
          </LegalSection>

          <LegalSection id="retention" title="Retention">
            <p>
              Account data is kept while your account is open and for a reasonable period after
              deletion for backups and legal records. Payment records and transaction signatures may
              be kept longer where needed for accounting, dispute or legal purposes. Server logs are
              kept for a short operational period.
            </p>
          </LegalSection>

          <LegalSection id="security" title="Security">
            <p>
              We use TLS in transit, hashed passwords, scoped database credentials and
              server-side verification for payments. No system is completely secure. You are
              responsible for securing your email account, wallet and devices. If you suspect
              unauthorised access, contact us immediately.
            </p>
          </LegalSection>

          <LegalSection id="rights" title="Your rights">
            <p>
              Depending on where you live, you may have the right to access, correct, delete, restrict
              or object to processing of your personal data, or to receive a portable copy. To make a
              request, email{" "}
              <a href="mailto:support@rugpulltool.dev" className="link link-primary">
                support@rugpulltool.dev
              </a>{" "}
              from the address on your account. We may need to verify your identity. You may also
              complain to your local data-protection authority.
            </p>
          </LegalSection>

          <LegalSection id="children" title="Children">
            <p>
              The Service is not intended for anyone under 18 (or the age of majority where they
              live). We do not knowingly collect data from children. If you believe a child has
              created an account, contact us and we will remove it.
            </p>
          </LegalSection>

          <LegalSection id="transfers" title="International transfers">
            <p>
              Our providers may process data in countries other than yours. Where required, we rely
              on appropriate safeguards for those transfers. By using the Service, you understand
              that data may be processed internationally.
            </p>
          </LegalSection>

          <LegalSection id="privacy-changes" title="Changes to this policy">
            <p>
              We may update this policy as the Service changes. The “Last updated” date at the top
              of this page reflects the current version. Material changes will be communicated on
              the site where appropriate.
            </p>
          </LegalSection>

          <section id="contact" className="scroll-mt-24 space-y-3 border-t border-base-300 pt-8">
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-base-content">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Contact
            </h2>
            <p>
              Questions about these terms or your data? Email{" "}
              <a href="mailto:support@rugpulltool.dev" className="link link-primary">
                support@rugpulltool.dev
              </a>
              . For payment issues, include the transaction signature. Never send a seed phrase or
              private key.
            </p>
            <p className="text-[11px] text-base-content/35">
              See also the{" "}
              <Link href="/docs" className="link link-hover">
                user guide
              </Link>{" "}
              and{" "}
              <Link href="/about" className="link link-hover">
                methodology
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}

function TocList({
  items,
  className = "",
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  return (
    <ul className={`space-y-0.5 text-[12.5px] ${className}`}>
      {items.map((item) => (
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

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-[15px] font-bold tracking-tight text-base-content sm:text-base">
        {title}
      </h2>
      <div className="space-y-3 text-[13px] leading-relaxed text-base-content/60">{children}</div>
    </section>
  );
}
