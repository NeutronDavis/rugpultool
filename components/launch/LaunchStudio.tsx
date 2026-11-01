"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  ImagePlus,
  Loader2,
  Rocket,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { ConnectButton } from "@/components/wallet/ConnectButton";

type Stage =
  | { step: "idle" }
  | { step: "uploading" }
  | { step: "building" }
  | { step: "signing" }
  | { step: "sending" }
  | { step: "done"; mint: string; signature: string; pool: string }
  | { step: "error"; message: string };

const IPFS_GATEWAY = "https://ipfs.io/ipfs";

interface MetadataJson {
  name: string;
  symbol: string;
  description: string;
  image: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export function LaunchStudio() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [devBuySol, setDevBuySol] = useState("0");
  const [pool, setPool] = useState<"pump" | "bonk">("pump");
  const [slippage, setSlippage] = useState("15");
  const [priorityFee, setPriorityFee] = useState("0.00005");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [stage, setStage] = useState<Stage>({ step: "idle" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const devBuy = Number(devBuySol) || 0;
  const busy = ["uploading", "building", "signing", "sending"].includes(stage.step);

  const estimatedCost = useMemo(
    () => (devBuy + 0.022 + Number(priorityFee || 0)).toFixed(4),
    [devBuy, priorityFee]
  );

  const ready =
    connected &&
    name.trim().length > 0 &&
    /^[A-Za-z0-9]{1,10}$/.test(symbol.trim()) &&
    imageFile !== null;

  const launch = useCallback(async () => {
    if (!publicKey || !signTransaction) {
      setStage({ step: "error", message: "Connect a wallet that can sign transactions." });
      return;
    }
    if (!imageFile) {
      setStage({ step: "error", message: "Choose a token image first." });
      return;
    }

    try {
      // 1. Pin the image to IPFS.
      setStage({ step: "uploading" });
      const imageForm = new FormData();
      imageForm.append("file", imageFile);
      imageForm.append("kind", "image");
      const imageRes = await fetch("/api/upload", { method: "POST", body: imageForm });
      const imageJson = await imageRes.json();
      if (!imageRes.ok) throw new Error(imageJson.error ?? "Image upload failed.");
      const imageUrl: string = imageJson.url;

      // 2. Pin the metadata JSON that wallets and DexScreener will read.
      const metadata: MetadataJson = {
        name: name.trim(),
        symbol: symbol.trim().toUpperCase(),
        description: description.trim(),
        image: imageUrl,
        ...(twitter.trim() ? { twitter: twitter.trim() } : {}),
        ...(telegram.trim() ? { telegram: telegram.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
      };
      const metaForm = new FormData();
      metaForm.append(
        "file",
        new File([JSON.stringify(metadata)], "metadata.json", { type: "application/json" })
      );
      metaForm.append("kind", "metadata");
      const metaRes = await fetch("/api/upload", { method: "POST", body: metaForm });
      const metaJson = await metaRes.json();
      if (!metaRes.ok) throw new Error(metaJson.error ?? "Metadata upload failed.");
      const metadataUri: string = metaJson.url;

      // 3. Mint keypair is generated here and never leaves this tab.
      setStage({ step: "building" });
      const mintKeypair = Keypair.generate();

      const buildRes = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey: publicKey.toBase58(),
          mint: mintKeypair.publicKey.toBase58(),
          tokenMetadata: {
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadataUri,
          },
          devBuySol: devBuy,
          slippage: Number(slippage) || 15,
          priorityFee: Number(priorityFee) || 0.00005,
          pool,
        }),
      });
      const buildJson = await buildRes.json();
      if (!buildRes.ok) {
        throw new Error(
          [buildJson.error, buildJson.detail].filter(Boolean).join(" — ") || "Could not build transaction."
        );
      }

      // 4. Partially sign with the mint keypair, then let the wallet sign.
      setStage({ step: "signing" });
      const tx = VersionedTransaction.deserialize(
        Uint8Array.from(atob(buildJson.transaction), (c) => c.charCodeAt(0))
      );
      tx.sign([mintKeypair]);
      const signed = await signTransaction(tx);

      // 5. Broadcast through the app's own RPC and wait for confirmation.
      setStage({ step: "sending" });
      const signature = await connection.sendRawTransaction(signed.serialize(), {
        maxRetries: 3,
        skipPreflight: false,
      });
      const confirmation = await connection.confirmTransaction(signature, "confirmed");
      if (confirmation.value.err) {
        throw new Error(
          `Transaction landed but failed on-chain: ${JSON.stringify(confirmation.value.err)}`
        );
      }

      setStage({
        step: "done",
        mint: mintKeypair.publicKey.toBase58(),
        signature,
        pool,
      });
    } catch (err) {
      setStage({ step: "error", message: (err as Error).message });
    }
  }, [
    publicKey,
    signTransaction,
    imageFile,
    name,
    symbol,
    description,
    twitter,
    telegram,
    website,
    devBuy,
    slippage,
    priorityFee,
    pool,
    connection,
  ]);

  if (stage.step === "done") {
    return <LaunchResult stage={stage} onReset={() => setStage({ step: "idle" })} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* ---------------- form ---------------- */}
      <div className="card card-border bg-base-200/50 p-4 sm:p-5 space-y-4 sm:space-y-5">
        <Field label="Token name" hint="Max 32 characters">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            placeholder="Rugg"
            className={inputCls}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Field label="Symbol" hint="1–10 letters/digits">
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              maxLength={10}
              placeholder="RUGG"
              className={inputCls}
            />
          </Field>
          <Field label="Chain">
            <div className="h-10 flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 text-sm text-base-content/70">
              <span className="h-2 w-2 rounded-full bg-success" />
              Solana
            </div>
          </Field>
        </div>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="What is this coin about?"
            className="textarea textarea-bordered w-full bg-base-100 border-base-300 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary resize-none py-2"
          />
        </Field>

        <Field label="Image" hint="PNG, JPG, WEBP or GIF · max 5 MB">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 rounded-lg border border-dashed border-base-300 hover:border-primary/60 bg-base-100/60 flex items-center justify-center gap-2 text-sm text-base-content/60 transition-colors"
          >
            <ImagePlus className="w-4 h-4 text-primary" />
            <span className="truncate max-w-[240px]">{imageFile ? imageFile.name : "Choose an image"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Field label="X / Twitter">
            <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/…" className={inputCls} />
          </Field>
          <Field label="Telegram">
            <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/…" className={inputCls} />
          </Field>
          <Field label="Website">
            <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className={inputCls} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Field label="Dev buy (SOL)" hint="Your opening position">
            <input
              type="number"
              min={0}
              step={0.01}
              value={devBuySol}
              onChange={(e) => setDevBuySol(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Slippage %">
            <input type="number" min={1} max={100} value={slippage} onChange={(e) => setSlippage(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Priority fee (SOL)">
            <input type="number" min={0.00001} step={0.00001} value={priorityFee} onChange={(e) => setPriorityFee(e.target.value)} className={inputCls} />
          </Field>
        </div>

        <Field label="Launch venue">
          <div className="flex gap-2">
            {(["pump", "bonk"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPool(p)}
                className={`btn flex-1 ${
                  pool === p
                    ? "btn-primary"
                    : "btn-outline border-base-300 text-base-content/60"
                }`}
              >
                {p === "pump" ? "pump.fun" : "bonk.fun"}
              </button>
            ))}
          </div>
        </Field>
      </div>

      {/* ---------------- preflight ---------------- */}
      <aside className="space-y-4">
        <div className="card card-border bg-base-200/50 p-4 sm:p-5">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-base-content">
            <ShieldCheck className="w-4 h-4 text-success" />
            Pre-flight
          </h3>
          <dl className="mt-4 space-y-2.5 text-xs">
            <Row label="Liquidity" value="Program-owned curve" good />
            <Row label="LP token" value="None exists" good />
            <Row label="Mint authority" value="Curve PDA" good />
            <Row label="Dev buy" value={`${devBuy.toFixed(4)} SOL`} good={devBuy === 0} />
            <Row label="Est. cost" value={`~${estimatedCost} SOL`} />
          </dl>
          <p className="mt-4 text-[11px] leading-relaxed text-base-content/40">
            There is no LP token on a bonding curve, so there is no liquidity for you to withdraw.
            Buyers can still watch you sell a dev allocation — that is why it is shown here
            before you launch.
          </p>
        </div>

        {stage.step === "error" && (
          <div className="alert alert-error alert-soft text-xs flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="break-words">{stage.message}</span>
          </div>
        )}

        {!connected ? (
          <div className="card card-border bg-base-200/50 p-5 text-center">
            <Wallet className="w-5 h-5 text-base-content/40 mx-auto" />
            <p className="mt-2 text-xs text-base-content/60">Connect a wallet to launch.</p>
            <div className="mt-3 flex justify-center">
              <ConnectButton />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={launch}
            disabled={!ready || busy}
            className="btn btn-primary btn-block h-11 text-sm font-semibold gap-2"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
            {labelFor(stage.step)}
          </button>
        )}
      </aside>
    </div>
  );
}

function LaunchResult({
  stage,
  onReset,
}: {
  stage: Extract<Stage, { step: "done" }>;
  onReset: () => void;
}) {
  const explorer = `https://solscan.io/token/${stage.mint}`;
  return (
    <div className="card card-border max-w-2xl mx-auto bg-base-200/50 p-5 sm:p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center mx-auto text-success">
        <Check className="w-6 h-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-base-content">Token is live</h2>
      <p className="mt-1 text-xs text-base-content/50">
        Confirmed on Solana. DexScreener indexing usually takes a few minutes.
      </p>

      <div className="mt-5 space-y-2 text-left">
        <ResultRow label="Mint" value={stage.mint} href={explorer} />
        <ResultRow
          label="Transaction"
          value={stage.signature}
          href={`https://solscan.io/tx/${stage.signature}`}
        />
        <ResultRow label="Venue" value={stage.pool === "pump" ? "pump.fun" : "bonk.fun"} />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
        <a
          href={`https://dexscreener.com/solana/${stage.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline gap-1.5"
        >
          <span>DexScreener</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <a
          href={`https://rugcheck.xyz/tokens/${stage.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline gap-1.5"
        >
          <span>RugCheck</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          type="button"
          onClick={onReset}
          className="btn btn-sm btn-primary"
        >
          Launch another
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "input input-bordered w-full h-10 bg-base-100 border-base-300 px-3 text-sm text-base-content placeholder:text-base-content/40 focus:outline-none focus:border-primary";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-base-content/70">
        {label}
        {hint && <span className="text-[10px] font-normal text-base-content/40">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Row({
  label,
  value,
  good,
}: {
  label: string;
  value: string;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-base-content/50">{label}</dt>
      <dd className={good ? "text-success font-medium" : "text-base-content/80 font-mono"}>{value}</dd>
    </div>
  );
}

function ResultRow({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3 rounded-lg border border-base-300 bg-base-100 px-3 py-2">
      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-base-content/40">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-base-content/80 hover:text-primary truncate"
        >
          {value.slice(0, 10)}…{value.slice(-8)}
        </a>
      ) : (
        <span className="font-mono text-xs text-base-content/80 truncate">{value}</span>
      )}
    </div>
  );
}

function labelFor(step: Stage["step"]): string {
  switch (step) {
    case "uploading":
      return "Pinning to IPFS…";
    case "building":
      return "Building transaction…";
    case "signing":
      return "Approve in wallet…";
    case "sending":
      return "Sending…";
    default:
      return "Launch token";
  }
}
