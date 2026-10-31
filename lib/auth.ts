import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";

const googleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    ...(googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;

        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const valid = await compare(password, user.passwordHash);
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          // Database unreachable: fail closed rather than 500 the login page.
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth users are persisted here because we run JWT sessions with no adapter.
      if (account?.provider === "google" && user.email) {
        await prisma.user.upsert({
          where: { email: user.email.toLowerCase() },
          create: {
            email: user.email.toLowerCase(),
            name: user.name,
            image: user.image,
          },
          update: {
            name: user.name ?? undefined,
            image: user.image ?? undefined,
          },
        });
      }
      return true;
    },

    async jwt({ token, user }) {
      const email = (user?.email ?? token.email)?.toLowerCase();
      if (!email) return token;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { id: true, plan: true, planExpiresAt: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.plan = dbUser.plan;
          token.planExpiresAt = dbUser.planExpiresAt?.getTime() ?? null;
        }
      } catch {
        // Leave the token untouched if the database is unavailable.
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        const plan = token.plan ?? "FREE";
        session.user.id = token.uid ?? "";
        session.user.plan = plan;
        session.user.entitled =
          plan !== "FREE" &&
          (token.planExpiresAt == null || token.planExpiresAt > Date.now());
      }
      return session;
    },
  },
};
