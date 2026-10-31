import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AuthForm } from "@/components/auth/AuthForm";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Sign in — rugpulltool",
  description: "Sign in to launch tokens and manage positions.",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/launch");

  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center py-6 sm:py-10 px-3 sm:px-4">
      <div className="mb-8 flex flex-col items-center">
        <Logo />
        <p className="mt-3 max-w-sm text-center text-[13px] leading-relaxed text-base-content/45">
          Sign in to launch tokens and manage positions. The risk radar stays open to everyone.
        </p>
      </div>

      <AuthForm googleEnabled={googleEnabled} />
    </div>
  );
}
