/**
 * Solana Pay billing engine (server-only).
 *
 * Flow:
 *   createCheckout()  -> Payment row + Solana Pay URL + QR
 *   findPayment()     -> poll the chain for a transfer that references the intent
 *   confirmPayment()  -> verify recipient/amount/reference, then activate the plan
 *
 * The reference key is a throwaway public key embedded in the transfer. It binds
 * a specific on-chain payment to a specific database intent, so a signature can
 * never be replayed against another payment.
 */

import "server-only";

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import QRCode from "qrcode";
import { PaymentStatus, Plan, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  PLAN_RANK,
  TESTER_DURATION_DAYS,
  isLivePlan,
  planDisplayName,
  planPriceSol,
  type PaidPlan,
} from "@/lib/plans";

const LAMPORTS_PER_SOL = 1_000_000_000;
const DAY_MS = 24 * 60 * 60 * 1000;
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,88}$/;

/** How long a checkout intent stays payable. */
export const PAYMENT_TTL_MS = 20 * 60 * 1000;

export class BillingConfigError extends Error {}

export class PaymentError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function getTreasuryWallet(): string {
  const treasury = process.env.NEXT_PUBLIC_TREASURY_WALLET?.trim();
  if (!treasury || !BASE58_RE.test(treasury)) {
    throw new BillingConfigError(
      "NEXT_PUBLIC_TREASURY_WALLET is not set to a valid Solana address. Add your treasury wallet to .env.local."
    );
  }
  return treasury;
}

export function getRpcUrl(): string {
  return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
}

let cachedConnection: Connection | null = null;

export function getConnection(): Connection {
  if (!cachedConnection) {
    cachedConnection = new Connection(getRpcUrl(), "confirmed");
  }
  return cachedConnection;
}

export function amountLamportsFor(plan: PaidPlan): bigint {
  return BigInt(Math.round(planPriceSol(plan) * LAMPORTS_PER_SOL));
}

export function createReference(): string {
  return Keypair.generate().publicKey.toBase58();
}

export function buildSolanaPayUrl(input: {
  recipient: string;
  amountSol: number;
  reference: string;
  plan: PaidPlan;
}): string {
  const url = new URL(`solana:${input.recipient}`);
  url.searchParams.set("amount", String(input.amountSol));
  url.searchParams.set("reference", input.reference);
  url.searchParams.set("label", "SolRugWatch");
  url.searchParams.set("message", `${planDisplayName(input.plan)} package`);
  return url.toString();
}

export type CheckoutPayload = {
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

/**
 * Creates (or reuses) a pending intent for this user + plan. Reusing keeps the
 * flow idempotent if the checkout page mounts twice or the user refreshes.
 */
export async function createCheckout(userId: string, plan: PaidPlan): Promise<CheckoutPayload> {
  const recipient = getTreasuryWallet();
  const now = new Date();

  // Expire this user's stale intents so they don't linger.
  await prisma.payment.updateMany({
    where: { userId, status: PaymentStatus.PENDING, expiresAt: { lt: now } },
    data: { status: PaymentStatus.EXPIRED },
  });

  const existing = await prisma.payment.findFirst({
    where: {
      userId,
      plan: Plan[plan],
      status: PaymentStatus.PENDING,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  const payment =
    existing ??
    (await prisma.payment.create({
      data: {
        userId,
        plan: Plan[plan],
        amountLamports: amountLamportsFor(plan),
        reference: createReference(),
        expiresAt: new Date(now.getTime() + PAYMENT_TTL_MS),
      },
    }));

  const amountSol = planPriceSol(plan);
  const solanaPayUrl = buildSolanaPayUrl({
    recipient,
    amountSol,
    reference: payment.reference,
    plan,
  });
  const qrDataUrl = await QRCode.toDataURL(solanaPayUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#000000", light: "#ffffff" },
  });

  return {
    id: payment.id,
    plan,
    amountSol: String(amountSol),
    amountLamports: payment.amountLamports.toString(),
    reference: payment.reference,
    recipient,
    solanaPayUrl,
    qrDataUrl,
    expiresAt: payment.expiresAt.toISOString(),
  };
}

export type OnChainCheck = { ok: true } | { ok: false; reason: string };

/**
 * Confirms that `signature` is a successful transfer of at least `amountLamports`
 * to `recipient`, and that the transaction references this payment intent.
 */
export async function verifyTransfer(input: {
  signature: string;
  reference: string;
  recipient: string;
  amountLamports: bigint;
}): Promise<OnChainCheck> {
  const connection = getConnection();

  let tx;
  try {
    tx = await connection.getTransaction(input.signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  } catch {
    return { ok: false, reason: "rpc_error" };
  }

  if (!tx) return { ok: false, reason: "not_found" };
  if (tx.meta?.err) return { ok: false, reason: "transaction_failed" };
  if (!tx.meta) return { ok: false, reason: "missing_meta" };

  const meta = tx.meta;
  const staticKeys = tx.transaction.message.staticAccountKeys.map((key) => key.toBase58());
  const loaded = meta.loadedAddresses;
  const allKeys = [
    ...staticKeys,
    ...(loaded?.writable ?? []).map((key) => key.toBase58()),
    ...(loaded?.readonly ?? []).map((key) => key.toBase58()),
  ];

  if (!allKeys.includes(input.reference)) {
    return { ok: false, reason: "reference_missing" };
  }

  const recipientIndex = allKeys.indexOf(input.recipient);
  if (recipientIndex < 0) return { ok: false, reason: "recipient_missing" };

  const delta =
    BigInt(meta.postBalances[recipientIndex]) - BigInt(meta.preBalances[recipientIndex]);

  if (delta < input.amountLamports) {
    return { ok: false, reason: "amount_too_low" };
  }

  return { ok: true };
}

/** Looks up successful transactions that referenced this intent, newest first. */
export async function findReferenceSignatures(reference: string): Promise<string[]> {
  const connection = getConnection();
  const signatures = await connection.getSignaturesForAddress(
    new PublicKey(reference),
    { limit: 10 },
    "confirmed"
  );
  return signatures.filter((entry) => !entry.err).map((entry) => entry.signature);
}

export type PaymentState = {
  status: "PENDING" | "CONFIRMED" | "EXPIRED";
  plan: string;
  planExpiresAt: Date | null;
  message?: string;
};

function reasonMessage(reason: string): string {
  switch (reason) {
    case "not_found":
      return "Transaction not found yet. If you just paid, wait a few seconds.";
    case "transaction_failed":
      return "That transaction failed on-chain.";
    case "reference_missing":
      return "That transaction does not belong to this checkout.";
    case "recipient_missing":
      return "That transaction did not pay the treasury wallet.";
    case "amount_too_low":
      return "The transferred amount is lower than the package price.";
    case "rpc_error":
      return "The Solana RPC is unavailable. Try again shortly.";
    default:
      return "Payment could not be verified yet.";
  }
}

/**
 * Verifies a signature and, if valid, atomically claims the payment and applies
 * the plan. Safe to call repeatedly: only the first call can claim the row.
 */
export async function confirmPayment(input: {
  paymentId: string;
  userId: string;
  signature: string;
}): Promise<PaymentState> {
  const payment = await prisma.payment.findFirst({
    where: { id: input.paymentId, userId: input.userId },
  });
  if (!payment) throw new PaymentError("Payment not found.", 404);

  if (payment.status === PaymentStatus.CONFIRMED) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { plan: true, planExpiresAt: true },
    });
    return {
      status: "CONFIRMED",
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      message: "Payment already confirmed.",
    };
  }

  if (payment.status === PaymentStatus.EXPIRED || payment.expiresAt.getTime() <= Date.now()) {
    if (payment.status === PaymentStatus.PENDING) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.EXPIRED },
      });
    }
    return { status: "EXPIRED", plan: payment.plan, planExpiresAt: null };
  }

  // A signature may only ever be claimed by one payment.
  const alreadyUsed = await prisma.payment.findUnique({
    where: { signature: input.signature },
    select: { id: true },
  });
  if (alreadyUsed && alreadyUsed.id !== payment.id) {
    throw new PaymentError("That transaction has already been used.", 409);
  }

  const treasury = getTreasuryWallet();
  const check = await verifyTransfer({
    signature: input.signature,
    reference: payment.reference,
    recipient: treasury,
    amountLamports: payment.amountLamports,
  });

  if (!check.ok) {
    return {
      status: "PENDING",
      plan: payment.plan,
      planExpiresAt: null,
      message: reasonMessage(check.reason),
    };
  }

  return prisma.$transaction(async (tx) => {
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.PENDING },
      data: {
        status: PaymentStatus.CONFIRMED,
        signature: input.signature,
        confirmedAt: new Date(),
      },
    });

    // Someone else confirmed it between our read and this update.
    if (claimed.count !== 1) {
      const current = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
      const user = await tx.user.findUniqueOrThrow({
        where: { id: input.userId },
        select: { plan: true, planExpiresAt: true },
      });
      return {
        status: current.status === PaymentStatus.CONFIRMED ? "CONFIRMED" : "PENDING",
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
        message: "Payment already confirmed.",
      } as PaymentState;
    }

    return applyPlanChange(tx, input.userId, payment.plan as PaidPlan, new Date());
  });
}

/**
 * Applies a purchased plan to a user. Exported separately so the upgrade,
 * renewal and no-downgrade rules can be tested without touching the chain.
 */
export async function applyPlanChange(
  tx: Prisma.TransactionClient,
  userId: string,
  purchasedPlan: PaidPlan,
  now: Date = new Date()
): Promise<PaymentState> {
  const user = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true },
  });

  const currentLive = isLivePlan(user.plan, user.planExpiresAt, now);
  const currentRank = PLAN_RANK[user.plan as keyof typeof PLAN_RANK] ?? 0;
  const purchasedRank = PLAN_RANK[purchasedPlan];

  // Never silently downgrade a live higher tier.
  if (currentLive && currentRank > purchasedRank) {
    return {
      status: "CONFIRMED",
      plan: user.plan,
      planExpiresAt: user.planExpiresAt,
      message: "Payment received. Your existing higher plan was kept.",
    };
  }

  let planExpiresAt: Date | null = null;
  if (purchasedPlan === "TESTER") {
    const base =
      currentLive && user.plan === Plan.TESTER && user.planExpiresAt
        ? user.planExpiresAt
        : now;
    planExpiresAt = new Date(base.getTime() + TESTER_DURATION_DAYS * DAY_MS);
  }

  const updated = await tx.user.update({
    where: { id: userId },
    data: { plan: Plan[purchasedPlan], planExpiresAt },
    select: { plan: true, planExpiresAt: true },
  });

  return {
    status: "CONFIRMED",
    plan: updated.plan,
    planExpiresAt: updated.planExpiresAt,
  };
}

/** Polling helper used by the checkout page. */
export async function getPaymentState(input: {
  paymentId: string;
  userId: string;
}): Promise<PaymentState> {
  const payment = await prisma.payment.findFirst({
    where: { id: input.paymentId, userId: input.userId },
  });
  if (!payment) throw new PaymentError("Payment not found.", 404);

  if (payment.status === PaymentStatus.CONFIRMED) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: input.userId },
      select: { plan: true, planExpiresAt: true },
    });
    return { status: "CONFIRMED", plan: user.plan, planExpiresAt: user.planExpiresAt };
  }

  if (payment.status === PaymentStatus.EXPIRED || payment.expiresAt.getTime() <= Date.now()) {
    if (payment.status === PaymentStatus.PENDING) {
      await prisma.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        data: { status: PaymentStatus.EXPIRED },
      });
    }
    return { status: "EXPIRED", plan: payment.plan, planExpiresAt: null };
  }

  let signatures: string[] = [];
  try {
    signatures = await findReferenceSignatures(payment.reference);
  } catch {
    // RPC hiccup: stay pending and let the next poll retry.
    return { status: "PENDING", plan: payment.plan, planExpiresAt: null };
  }

  if (signatures.length === 0) {
    return { status: "PENDING", plan: payment.plan, planExpiresAt: null };
  }

  // Try each referenced transaction until one actually pays the intent. This
  // avoids getting stuck if an unrelated tx happened to include the reference.
  let lastMessage: string | undefined;
  for (const signature of signatures) {
    try {
      const state = await confirmPayment({
        paymentId: payment.id,
        userId: input.userId,
        signature,
      });
      if (state.status === "CONFIRMED") return state;
      if (state.status === "EXPIRED") return state;
      lastMessage = state.message ?? lastMessage;
    } catch (err) {
      if (err instanceof PaymentError) {
        lastMessage = err.message;
        continue;
      }
      throw err;
    }
  }

  return {
    status: "PENDING",
    plan: payment.plan,
    planExpiresAt: null,
    message: lastMessage,
  };
}
