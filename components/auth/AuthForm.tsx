"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, Loader2 } from "lucide-react";

export function AuthForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear stale errors when switching between the two forms.
  useEffect(() => setError(null), [mode]);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 8,
    [email, password]
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Could not create the account.");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/launch",
      });

      if (!result || result.error) {
        throw new Error(
          mode === "signup"
            ? "Account created, but automatic sign-in failed. Try signing in."
            : "Incorrect email or password."
        );
      }

      router.push("/launch");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-border bg-base-200/50 p-5 sm:p-6 w-full max-w-md mx-auto">
      <div className="tabs tabs-box mb-6 grid grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`tab ${mode === "signin" ? "tab-active" : ""}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`tab ${mode === "signup" ? "tab-active" : ""}`}
        >
          Create account
        </button>
      </div>

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/launch" })}
            disabled={loading}
            className="btn btn-outline btn-block border-base-300 gap-2"
          >
            <GoogleMark />
            Continue with Google
          </button>
          <div className="divider my-5 text-[11px] uppercase tracking-[0.14em] text-base-content/30">
            or
          </div>
        </>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "signup" && (
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-base-content/60">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Satoshi"
              autoComplete="name"
              className="input input-bordered w-full bg-base-100 border-base-300 text-sm"
            />
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-base-content/60">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="input input-bordered w-full bg-base-100 border-base-300 text-sm"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-base-content/60">
            Password
            {mode === "signup" && (
              <span className="ml-1 font-normal text-base-content/30">(min 8 characters)</span>
            )}
          </span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="input input-bordered w-full bg-base-100 border-base-300 text-sm"
          />
        </label>

        {error && (
          <div className="alert alert-error alert-soft py-2 text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="btn btn-primary btn-block"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-5 text-center text-[11px] leading-relaxed text-base-content/35">
        By continuing you agree that launching a token is your own responsibility and that
        memecoins can lose all of their value.
      </p>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.26-2.09 3.56-5.17 3.56-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.59 1.79l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.87 8.87 4.76 12 4.76z"
      />
    </svg>
  );
}
