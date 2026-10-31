/**
 * Seed script for the rugpulltool database.
 *
 * Covers every table in schema.prisma:
 *   - users                (FREE / TESTER / BASIC / ADVANCED / PREMIUM)
 *   - accounts             (one Google-linked example)
 *   - sessions             (one active NextAuth session)
 *   - verification_tokens  (one example email-verification token)
 *   - payments             (one historical confirmed Solana Pay payment)
 *
 * Idempotent: safe to run repeatedly (`npm run db:seed`).
 *
 * Demo passwords (all hashed with bcrypt, cost 12):
 *   demo@rugpulltool.dev     / Demo1234!
 *   free@rugpulltool.dev     / Free1234!
 *   tester@rugpulltool.dev   / Tester1234!
 *   basic@rugpulltool.dev    / Basic1234!
 *   advanced@rugpulltool.dev / Advanced1234!
 *   premium@rugpulltool.dev  / Premium1234!
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

const DAY = 24 * 60 * 60 * 1000;

async function main() {
  const password = await hash("Demo1234!", 12);
  const now = Date.now();

  const users = [
    {
      email: "demo@rugpulltool.dev",
      name: "Demo User",
      passwordHash: password,
      plan: "ADVANCED",
      planExpiresAt: null, // paid tiers = lifetime unless set
    },
    {
      email: "free@rugpulltool.dev",
      name: "Free Tier",
      passwordHash: await hash("Free1234!", 12),
      plan: "FREE",
      planExpiresAt: null,
    },
    {
      email: "tester@rugpulltool.dev",
      name: "Week Tester",
      passwordHash: await hash("Tester1234!", 12),
      plan: "TESTER",
      planExpiresAt: new Date(now + 7 * DAY),
    },
    {
      email: "basic@rugpulltool.dev",
      name: "Basic Holder",
      passwordHash: await hash("Basic1234!", 12),
      plan: "BASIC",
      planExpiresAt: null,
    },
    {
      email: "advanced@rugpulltool.dev",
      name: "Advanced Holder",
      passwordHash: await hash("Advanced1234!", 12),
      plan: "ADVANCED",
      planExpiresAt: null,
    },
    {
      email: "premium@rugpulltool.dev",
      name: "Premium Holder",
      passwordHash: await hash("Premium1234!", 12),
      plan: "PREMIUM",
      planExpiresAt: null,
    },
    {
      // Google-only account: no passwordHash.
      email: "google.user@rugpulltool.dev",
      name: "Google User",
      image: "https://lh3.googleusercontent.com/a/default-user=s96-c",
      passwordHash: null,
      plan: "FREE",
      planExpiresAt: null,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      create: user,
      update: {
        name: user.name,
        image: user.image ?? null,
        plan: user.plan,
        planExpiresAt: user.planExpiresAt,
      },
    });
  }

  const googleUser = await prisma.user.findUniqueOrThrow({
    where: { email: "google.user@rugpulltool.dev" },
  });
  const demoUser = await prisma.user.findUniqueOrThrow({
    where: { email: "demo@rugpulltool.dev" },
  });

  // One linked Google account (shows how OAuth rows look).
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: "100000000000000000001",
      },
    },
    create: {
      userId: googleUser.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "100000000000000000001",
      access_token: "seed-access-token",
      token_type: "Bearer",
      scope: "openid email profile",
    },
    update: { userId: googleUser.id },
  });

  // One active session row (useful if you switch to database sessions later).
  const sessionToken = "seed-session-token-demo-user";
  await prisma.session.upsert({
    where: { sessionToken },
    create: {
      sessionToken,
      userId: demoUser.id,
      expires: new Date(now + 30 * DAY),
    },
    update: { userId: demoUser.id, expires: new Date(now + 30 * DAY) },
  });

  // One verification token example.
  const identifier = "verify@rugpulltool.dev";
  const token = `seed-verify-${randomUUID()}`;
  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires: new Date(now + DAY) },
  });

  // One historical confirmed payment (shows the Solana Pay intent shape).
  const paymentReference = "seed-payment-basic-demo";
  await prisma.payment.upsert({
    where: { reference: paymentReference },
    create: {
      userId: demoUser.id,
      plan: "BASIC",
      amountLamports: BigInt(4_900_000_000), // 4.9 SOL
      reference: paymentReference,
      status: "CONFIRMED",
      signature: "seed-signature-basic-demo",
      confirmedAt: new Date(now - 30 * DAY),
      expiresAt: new Date(now - 30 * DAY + 20 * 60 * 1000),
    },
    update: { userId: demoUser.id },
  });

  const counts = {
    users: await prisma.user.count(),
    accounts: await prisma.account.count(),
    sessions: await prisma.session.count(),
    verificationTokens: await prisma.verificationToken.count(),
    payments: await prisma.payment.count(),
  };

  console.log("Seed complete:", counts);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
