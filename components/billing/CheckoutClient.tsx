"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  Wallet,
} from "lucide-react";

import { ConnectButton } from "@/components/wallet/ConnectButton";
import { SolanaMark } from "@/components/brand/PartnerMarks";
import type { PaidPlan } from "@/lib/plans";

type CheckoutPayment = {
  id: string;
  plan: PaidPlan;
  amountSol: string;
  amountLamports: string;
  reference: string;
  recipient: string;
  solanaPayUrl: string;
  qrDataUrl: string;
  expiresAt: string;
};

type PaymentStatus = "PENDING" | "CONFIRMED" | "EXPIRED";

export function CheckoutClient({
  plan,
  planName,
  currentPlan,
  alreadyActive,
  email,
}: {
  plan: PaidPlan;
  planName: string;
  currentPlan: string;
  alreadyActive: boolean;
  email?: string | null;
}) {
  const router = useRouter();
  const { update } = useSession();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const startedRef = useRef(false);
  const [payment, setPayment] = useState<CheckoutPayment | null>(null);
  const [status, setStatus] = useState<PaymentStatus>("PENDING");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

  const createCheckout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not start the checkout.");
      setPayment(json.payment);
      setStatus("PENDING");
      setMessage(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [plan]);

  useEffect(() => {
    if (alreadyActive || startedRef.current) return;
    startedRef.current = true;
    void createCheckout();
  }, [alreadyActive, createCheckout]);

  const handleConfirmed = useCallback(
    async (nextPlan: string) => {
      setStatus("CONFIRMED");
      setActivatedPlan(nextPlan);
      setMessage(null);
      try {
        await update();
      } catch {
        // Session refresh is best-effort; the server already activated the plan.
      }
      router.refresh();
    },
    [router, update]
  );

  // Poll the server while the intent is open. The server checks the chain for a
  // transfer that carries this checkout's reference key.
  useEffect(() => {
    if (!payment || status !== "PENDING") return;
    let cancelled = false;

    const tick = async () => {
      try {
        const res = await fetch(`/api/billing/status?paymentId=${encodeURIComponent(payment.id)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) return;
        if (json.status === "CONFIRMED") {
          await handleConfirmed(json.plan);
        } else if (json.status === "EXPIRED") {
          setStatus("EXPIRED");
        } else if (json.message) {
          setMessage(json.message);
        }
      } catch {
        // Network blip: keep polling.
      }
    };

    const id = window.setInterval(tick, 5000);
    void tick();
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [payment, status, handleConfirmed]);

  async function payWithWallet() {
    if (!payment || !publicKey) return;
    setPaying(true);
    setError(null);
    setMessage(null);

    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");

      const instruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey(payment.recipient),
        lamports: Number(payment.amountLamports),
      });
      // Solana Pay convention: attach the reference as a read-only account so
      // the server can find this exact transfer.
      instruction.keys.push({
        pubkey: new PublicKey(payment.reference),
        isSigner: false,
        isWritable: false,
      });

      const transaction = new Transaction().add(instruction);
      transaction.feePayer = publicKey;
      transaction.recentBlockhash = blockhash;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(
        { signature, blockhash, lastValidBlockHeight },
        "confirmed"
      );

      const res = await fetch("/api/billing/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id, signature }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not verify the payment.");

      if (json.status === "CONFIRMED") {
        await handleConfirmed(json.plan);
      } else {
        setMessage(json.message ?? "Payment sent. Waiting for confirmation…");
      }
    } catch (err) {
      const text = (err as Error).message ?? "";
      setError(
        /user rejected|rejected the request/i.test(text)
          ? "Transaction cancelled in your wallet."
          : text || "The payment could not be sent."
      );
    } finally {
      setPaying(false);
    }
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard may be blocked; ignore.
    }
  }

  if (alreadyActive) {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="card card-border bg-base-200/50">
          <div className="card-body items-center gap-4 p-6 text-center sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-success/10 ring-1 ring-success/30">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">You already have this plan</h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/55">
                {email ? `${email} is on the ` : "This account is on the "}
                <span className="font-medium text-base-content/80">{currentPlan}</span> plan, which
                already includes {planName}. There is nothing to pay.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
              <Link href="/launch" className="btn btn-primary w-full sm:w-auto">
                Go to Launch Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/#pricing" className="btn btn-ghost w-full sm:w-auto">
                Compare plans
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "CONFIRMED") {
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="card card-border border-success/40 bg-base-200/50">
          <div className="card-body items-center gap-4 p-6 text-center sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-success/10 ring-1 ring-success/30">
              <CheckCircle2 className="h-6 w-6 text-success" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Payment confirmed</h1>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-base-content/55">
                {activatedPlan ?? planName} is now active
                {activatedPlan === "TESTER" ? " for the next 7 days" : " for life"}. Launch Studio
                and position controls are unlocked.
              </p>
              {message && (
                <p className="mt-2 text-xs text-base-content/45">{message}</p>
              )}
            </div>
            <Link href="/launch" className="btn btn-primary w-full sm:w-auto">
              Start launching
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-base-content/40">
          Checkout
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {planName} package
        </h1>
        <p className="text-sm text-base-content/55">
          {plan === "TESTER" ? "7 days of full access." : "One payment, lifetime access."} Pay in SOL
          from any Solana wallet.
        </p>
      </div>

      {error && (
        <div className="alert alert-error alert-soft mb-4 text-xs">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="card card-border bg-base-200/50">
          <div className="card-body items-center gap-3 p-10 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm text-base-content/55">Preparing your payment request…</p>
          </div>
        </div>
      )}

      {!loading && !payment && error && (
        <div className="card card-border bg-base-200/50">
          <div className="card-body gap-3 p-6">
            <p className="text-sm text-base-content/60">
              The checkout could not be created. If you are the operator, set
              <code className="mx-1 rounded bg-base-300 px-1.5 py-0.5 text-[11px]">
                NEXT_PUBLIC_TREASURY_WALLET
              </code>
              to your Solana treasury address and restart the server.
            </p>
            <button type="button" onClick={createCheckout} className="btn btn-outline btn-sm w-fit gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      )}

      {payment && status === "EXPIRED" && (
        <div className="card card-border bg-base-200/50">
          <div className="card-body items-center gap-3 p-8 text-center">
            <Clock className="h-6 w-6 text-warning" />
            <p className="text-sm text-base-content/60">
              This payment request expired. Create a fresh one to continue.
            </p>
            <button type="button" onClick={createCheckout} className="btn btn-primary btn-sm gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              New payment request
            </button>
          </div>
        </div>
      )}

      {payment && status === "PENDING" && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <div className="card card-border bg-white">
            <div className="card-body items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={payment.qrDataUrl}
                alt={`Solana Pay QR code for the ${planName} package`}
                className="h-auto w-full max-w-[260px]"
              />
              <p className="text-center text-[11px] leading-relaxed text-neutral-500">
                Scan with Phantom, Solflare or any Solana Pay wallet.
              </p>
            </div>
          </div>

          <div className="card card-border bg-base-200/50">
            <div className="card-body gap-4 p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-3 border-b border-base-300 pb-4">
                <span className="text-[11px] uppercase tracking-[0.14em] text-base-content/40">
                  Amount
                </span>
                <span className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold tabular-nums">{payment.amountSol}</span>
                  <span className="flex items-center gap-1 text-xs text-base-content/50">
                    <SolanaMark className="h-3.5 w-3.5" />
                    SOL
                  </span>
                </span>
              </div>

              <Field label="Treasury wallet" value={payment.recipient} onCopy={() => copy(payment.recipient, "recipient")} copied={copied === "recipient"} />
              <Field label="Reference" value={payment.reference} onCopy={() => copy(payment.reference, "reference")} copied={copied === "reference"} />

              <a
                href={payment.solanaPayUrl}
                className="btn btn-outline btn-sm w-full gap-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in wallet
              </a>

              <div className="rounded-lg border border-base-300 bg-base-100/60 p-3">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em] text-base-content/40">
                  <Wallet className="h-3.5 w-3.5" />
                  Pay from this browser
                </div>
                {connected && publicKey ? (
                  <button
                    type="button"
                    onClick={payWithWallet}
                    disabled={paying}
                    className="btn btn-primary btn-sm w-full gap-2"
                  >
                    {paying ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SolanaMark className="h-3.5 w-3.5" />
                    )}
                    {paying ? "Waiting for wallet…" : `Pay ${payment.amountSol} SOL`}
                  </button>
                ) : (
                  <div className="flex flex-col items-stretch gap-2">
                    <ConnectButton className="w-full justify-center" />
                    <p className="text-center text-[10px] text-base-content/35">
                      Connect a wallet to pay without scanning.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-base-300/40 p-3 text-[11px] leading-relaxed text-base-content/45">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Request expires at {new Date(payment.expiresAt).toLocaleTimeString()}. We check
                  the chain automatically every few seconds.
                </span>
              </div>

              {message && (
                <p className="text-[11px] leading-relaxed text-warning">{message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] uppercase tracking-[0.12em] text-base-content/40">{label}</span>
      <span className="flex min-w-0 items-center gap-1.5">
        <code className="max-w-[150px] truncate rounded bg-base-300/60 px-1.5 py-0.5 text-[11px] text-base-content/70 sm:max-w-[190px]">
          {value}
        </code>
        <button
          type="button"
          onClick={onCopy}
          aria-label={`Copy ${label}`}
          className="btn btn-ghost btn-xs btn-square"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </span>
    </div>
  );
}
