# Auth, Database & Subscription Guide

This document covers the three operational pieces added to SolRugWatch:

1. Google sign-in / sign-up
2. Database publishing + seed data
3. A subscription strategy that fits the existing `Plan` model

---

## 1. Google sign-in / sign-up

The code is **already implemented**:

- `lib/auth.ts` registers the Google provider when both env vars exist.
- `app/(shell)/login/page.tsx` passes `googleEnabled` to the form.
- `components/auth/AuthForm.tsx` shows **Continue with Google** only when configured.
- The `signIn` callback upserts the Google user into `users`, so a Google sign-up
  and a Google sign-in are the same flow.

You only need Google Cloud credentials.

### Step-by-step

1. Go to <https://console.cloud.google.com/> and create (or select) a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name, support email, developer email
   - Scopes: `openid`, `email`, `profile` (the defaults)
   - While in *Testing*, add each tester under **Test users**.
   - Publish the app before real users sign in.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `SolRugWatch`
   - **Authorised JavaScript origins**
     - `http://localhost:3001`
     - `https://your-production-domain.com`
   - **Authorised redirect URIs**
     - `http://localhost:3001/api/auth/callback/google`
     - `https://your-production-domain.com/api/auth/callback/google`
4. Copy the **Client ID** and **Client secret** into `.env.local`:

   ```env
   GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
   ```

5. Restart `npm run dev`. The Google button appears on `/login`.

### Production checklist

- Set the same two variables in your host (Vercel → Project → Settings → Environment Variables).
- Set `NEXTAUTH_URL` to the exact public origin, e.g. `https://your-domain.com`.
- Keep `NEXTAUTH_SECRET` stable — changing it logs everyone out.
- Add the production redirect URI in Google Cloud **before** deploying.

> `allowDangerousEmailAccountLinking: true` is already set. That lets a user who
> signed up with email/password later use Google with the same address and land on
> the same account. Only keep this if you trust Google's verified email claim.

---

## 2. Database publishing & seed data

### Schema

`prisma/schema.prisma` defines four tables:

| Table | Purpose |
| --- | --- |
| `users` | App account + `plan` / `planExpiresAt` |
| `accounts` | NextAuth OAuth provider links |
| `sessions` | NextAuth session rows (unused while JWT strategy is on) |
| `verification_tokens` | Email verification tokens |

> Aiven enforces `sql_require_primary_key=ON`, so `verification_tokens` uses a
> composite primary key `@@id([identifier, token])`.

### Publish the schema

The Prisma CLI reads `.env` (Next.js reads `.env.local`), so keep `DATABASE_URL`
in both files. Then:

```bash
npm run db:push     # create/update tables in Aiven MySQL
npm run db:seed     # insert demo data
npm run db:studio   # optional visual browser
```

`npm run db:push` is the right command while the schema is still moving. Once you
want an auditable history, switch to `prisma migrate dev` and commit the
`prisma/migrations` folder.

### Seed data

`prisma/seed.mjs` is idempotent (upserts) and covers every table. It creates:

| Email | Password | Plan | Expiry |
| --- | --- | --- | --- |
| `demo@rugpulltool.dev` | `Demo1234!` | ADVANCED | lifetime |
| `free@rugpulltool.dev` | `Free1234!` | FREE | — |
| `tester@rugpulltool.dev` | `Tester1234!` | TESTER | +7 days |
| `basic@rugpulltool.dev` | `Basic1234!` | BASIC | lifetime |
| `advanced@rugpulltool.dev` | `Advanced1234!` | ADVANCED | lifetime |
| `premium@rugpulltool.dev` | `Premium1234!` | PREMIUM | lifetime |
| `google.user@rugpulltool.dev` | *(Google only)* | FREE | — |

It also inserts one `accounts` row (Google), one `sessions` row, and one
`verification_tokens` row.

**Change these passwords before exposing the deployment publicly.**

---

## 3. Subscription strategy

### What already exists

- `Plan` enum: `FREE`, `TESTER`, `BASIC`, `ADVANCED`, `PREMIUM`.
- `User.plan` + `User.planExpiresAt` (null = lifetime).
- JWT session carries `plan` and computed `entitled`.
- Server gates: `/launch` page, `/api/launch`, `/portfolio`.
- `lib/plans.ts` is the single source of pricing.
- `components/billing/Paywall.tsx` is the upsell surface.

### Recommended model: SOL-native subscriptions

Because the product and pricing are already denominated in SOL, charge in SOL.
This avoids card processors, chargebacks, and fiat conversion.

**Phase 1 — Solana Pay checkout (implemented)**

The full flow is live:

1. User picks a plan on `/#pricing` → `/login?plan=basic`.
2. After sign-in, `AuthForm` redirects to `/checkout?plan=basic`.
3. The checkout page calls `POST /api/billing/checkout`, which creates a
   `payments` row and returns a Solana Pay URL + QR code.
4. The user pays by:
   - scanning the QR with Phantom/Solflare, or
   - clicking **Pay with connected wallet** (the browser builds the transfer).
5. `GET /api/billing/status?paymentId=…` polls the chain for a transfer that
   includes the intent's one-time reference key. `POST /api/billing/verify`
   verifies a signature directly after an in-browser payment.
6. Verification checks, server-side:
   - the transaction succeeded,
   - the reference key is present (binds it to this intent),
   - the treasury wallet's lamport delta ≥ the package price.
7. The payment row is atomically claimed (`PENDING → CONFIRMED`) and
   `users.plan` / `users.planExpiresAt` are updated in the same transaction.

**Key files**

| File | Role |
| --- | --- |
| `lib/billing.ts` | Checkout creation, on-chain verification, activation |
| `app/api/billing/checkout/route.ts` | Creates/reuses an intent |
| `app/api/billing/status/route.ts` | Polls chain and confirms |
| `app/api/billing/verify/route.ts` | Verifies a known signature |
| `app/(shell)/checkout/page.tsx` | Server page + plan guard |
| `components/billing/CheckoutClient.tsx` | QR, wallet payment, polling |
| `prisma/schema.prisma` → `Payment` | Intent + signature + status |

**Required environment**

```env
NEXT_PUBLIC_TREASURY_WALLET=<your Solana treasury address>
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

`NEXT_PUBLIC_TREASURY_WALLET` is a **public** address — never put a private key
in env vars. The server only needs the address to verify transfers.

**Safety rules baked in**

- A transaction signature can only be claimed once (`signature` is unique).
- Amount and recipient come from the database intent, never from the client.
- A live higher tier is never silently downgraded by buying a lower one.
- `TESTER` purchases extend the existing expiry by 7 days.
- Payment intents expire after 20 minutes.

**Phase 2 — automatic renewal**


- Store `Subscription` rows: `userId`, `plan`, `startedAt`, `expiresAt`,
  `txSignature`, `status`.
- A daily cron (Vercel Cron or GitHub Action) expires lapsed plans and sends a
  renewal reminder.
- Offer auto-renew by charging a pre-authorized amount monthly — only if you
  accept the operational/legal overhead. Otherwise use manual monthly renewal.

**Phase 3 — recurring billing (if you want cards)**

Use a merchant-of-record such as Lemon Squeezy or Paddle. They handle tax and
subscription state; your webhook sets `plan` and `planExpiresAt`. Keep the SOL
flow as a parallel option.

### Recommended packaging

| Tier | Price | Access | Best for |
| --- | --- | --- | --- |
| FREE | 0 | Risk radar, read-only dashboard | Acquisition |
| TESTER | 2.8 SOL | 7 days, all launch features | Trial |
| BASIC | 4.9 SOL | Lifetime launch + position controls | One-off launches |
| ADVANCED | 7.7 SOL | Lifetime + promotion tools | Repeat launchers |
| PREMIUM | 9.8 SOL | Lifetime + full marketing | Serious projects |

Keep **FREE read-only** so the radar remains a funnel. Gate only value actions
(launching, position management, promotion) — which is already how the app works.

### Entitlement rules (keep server-side)

```ts
entitled = plan !== "FREE" && (planExpiresAt == null || planExpiresAt > now)
```

Re-check this in every paid API route, not only in the page. `/api/launch`
already does. Add the same check to any future paid endpoint.

### Practical guardrails

- **Never trust the JWT for money actions.** Read `plan`/`planExpiresAt` from the
  database inside the payment-verification route.
- **Idempotency:** store the payment signature and reject duplicates.
- **Grace period:** give 24–48 hours after expiry before hard-locking.
- **Refunds/disputes:** publish a clear policy; on-chain payments are final.
- **Analytics:** log plan, price, and signature to measure conversion.
- **Security:** keep the treasury private key in a wallet, never in env vars;
  the server only needs the public address to verify payments.
