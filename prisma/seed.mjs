/**
 * Seed script for the rugpulltool database.
 *
 * Covers every table in schema.prisma:
 *   - users                (FREE / TESTER / BASIC / ADVANCED / PREMIUM)
 *   - accounts             (one Google-linked example)
 *   - sessions             (one active NextAuth session)
 *   - verification_tokens  (one example email-verification token)
 *   - payments             (one historical confirmed Solana Pay payment)
 *   - reviews              (sample testimonials for the public reviews page)
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

  // Sample testimonials for /reviews. Replace with real customer reviews.
  const reviews = [
    {
      id: "seed-review-1",
      authorName: "Marcus T.",
      handle: "@marcusonchain",
      plan: "ADVANCED",
      rating: 5,
      title: "Caught a bad launch before I aped",
      body: "The radar flagged a token with an active mint authority minutes after it launched. I skipped it and watched it get drained the same day. The free radar alone is worth checking every morning.",
      featured: true,
      createdAt: new Date(now - 2 * DAY),
    },
    {
      id: "seed-review-2",
      authorName: "Lena K.",
      handle: "@lenabuilds",
      plan: "PREMIUM",
      rating: 5,
      title: "The cleanest launch flow I have used",
      body: "Image upload, metadata, dev buy and the pre-flight review are all in one place. I signed once and the token was live. No juggling five tabs or copying mint addresses around.",
      featured: true,
      createdAt: new Date(now - 5 * DAY),
    },
    {
      id: "seed-review-3",
      authorName: "Priya S.",
      handle: "@priyafinds",
      plan: "TESTER",
      rating: 5,
      title: "Used the free radar for a week first",
      body: "I tested the radar for a week before paying for the Tester plan. It was obvious what I was getting, and the 7-day access was enough for my first launch. Extended it afterwards.",
      featured: true,
      createdAt: new Date(now - 8 * DAY),
    },
    {
      id: "seed-review-4",
      authorName: "Deon R.",
      handle: "@deon_sol",
      plan: "PREMIUM",
      rating: 5,
      title: "Checkout was instant",
      body: "Paid with Solana Pay from Phantom and the plan unlocked before I switched tabs. No email confirmation loop, no waiting for an admin. Exactly how it should work.",
      featured: false,
      createdAt: new Date(now - 11 * DAY),
    },
    {
      id: "seed-review-5",
      authorName: "Kenji M.",
      handle: "@kenji_xyz",
      plan: "ADVANCED",
      rating: 4,
      title: "Accurate flags, would like more filters",
      body: "The risk flags have been reliable for me. I would like a few more filters on the radar table, but the token detail page gives me everything I need before a trade.",
      featured: false,
      createdAt: new Date(now - 14 * DAY),
    },
    {
      id: "seed-review-6",
      authorName: "Amara O.",
      handle: "@amaraonchain",
      plan: "BASIC",
      rating: 5,
      title: "No surprises before signing",
      body: "The pre-flight panel showing the exact dev buy is a small thing that matters a lot. I knew what I was signing before the wallet popped up. Positions page is just as clear.",
      featured: false,
      createdAt: new Date(now - 18 * DAY),
    },
    {
      id: "seed-review-7",
      authorName: "Tomas V.",
      handle: "@tomasv",
      plan: "PREMIUM",
      rating: 4,
      title: "Fast and documented",
      body: "Set up an account, connected Solflare and launched in one sitting. The user guide answered the two questions I had about fees. Support replied the same day.",
      featured: false,
      createdAt: new Date(now - 23 * DAY),
    },
    {
      id: "seed-review-8",
      authorName: "Nia B.",
      handle: "@niabuilds",
      plan: "TESTER",
      rating: 4,
      title: "Good trial length",
      body: "Seven days was enough to launch and test the positions page. I would have liked a reminder before expiry, but the plan did exactly what it said on the pricing page.",
      featured: false,
      createdAt: new Date(now - 27 * DAY),
    },
  ];

  for (const review of reviews) {
    await prisma.review.upsert({
      where: { id: review.id },
      create: { ...review, published: true },
      update: {
        authorName: review.authorName,
        handle: review.handle,
        plan: review.plan,
        rating: review.rating,
        title: review.title,
        body: review.body,
        featured: review.featured,
        published: true,
      },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    accounts: await prisma.account.count(),
    sessions: await prisma.session.count(),
    verificationTokens: await prisma.verificationToken.count(),
    payments: await prisma.payment.count(),
    reviews: await prisma.review.count(),
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
