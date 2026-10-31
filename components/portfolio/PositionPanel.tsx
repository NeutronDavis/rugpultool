"use client";

import { useCallback, useEffect, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Loader2, RefreshCw, Wallet, Coins, AlertTriangle } from "lucide-react";

import { ConnectButton } from "@/components/wallet/ConnectButton";
import { loadHoldings, type HeldToken } from "@/lib/portfolio";

type SellState = Record<string, "idle" | "signing" | "sending" | "error">;

export function PositionPanel() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();

  const [holdings, setHoldings] = useState<HeldToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slippage, setSlippage] = useState("15");
  const [sellState, setSellState] = useState<SellState>({});

  const refresh = useCallback(async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      setHoldings(await loadHoldings(connection, publicKey));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) void refresh();
    else setHoldings([]);
  }, [connected, publicKey, refresh]);

  const sell = useCallback(
    async (token: HeldToken, pct: number) => {
      if (!publicKey || !signTransaction) return;

      const raw = token.amountUi * pct;
      // Clamp to the token's precision so float dust doesn't fail the tx.
      const amount = pct === 1 ? token.amountUi : Number(raw.toFixed(token.decimals));

      setSellState((s) => ({ ...s, [token.mint]: "signing" }));
      try {
        const res = await fetch("/api/sell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            publicKey: publicKey.toBase58(),
            mint: token.mint,
            amount,
            slippage: Number(slippage) || 15,
            pool: token.pool,
          }),
        });
        const json = await res.json();
        if (!res.ok) {
          throw new Error([json.error, json.detail].filter(Boolean).join(" — "));
        }

        const tx = VersionedTransaction.deserialize(
          Uint8Array.from(atob(json.transaction), (c) => c.charCodeAt(0))
        );
        const signed = await signTransaction(tx);

        setSellState((s) => ({ ...s, [token.mint]: "sending" }));
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          maxRetries: 3,
        });
        const confirmation = await connection.confirmTransaction(signature, "confirmed");
        if (confirmation.value.err) {
          throw new Error(`Sell landed but failed: ${JSON.stringify(confirmation.value.err)}`);
        }

        setSellState((s) => ({ ...s, [token.mint]: "idle" }));
        await refresh();
      } catch (err) {
        setSellState((s) => ({ ...s, [token.mint]: "error" }));
        setError((err as Error).message);
      }
    },
    [publicKey, signTransaction, slippage, connection, refresh]
  );

  if (!connected) {
    return (
      <div className="card card-border bg-base-200/50 p-6 sm:p-8 text-center">
        <Wallet className="w-6 h-6 text-base-content/40 mx-auto" />
        <p className="mt-3 text-sm text-base-content/60">Connect a wallet to see your positions.</p>
        <div className="mt-4 flex justify-center">
          <ConnectButton />
        </div>
      </div>
    );
  }

  const total = holdings.reduce((sum, h) => sum + (h.valueUsd ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="card card-border bg-base-200/50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-base-content/40">Portfolio value</p>
          <p className="text-xl sm:text-2xl font-bold text-base-content tabular-nums">
            ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <label className="flex items-center gap-2 text-xs text-base-content/60">
            Slippage
            <input
              type="number"
              min={1}
              max={100}
              value={slippage}
              onChange={(e) => setSlippage(e.target.value)}
              className="input input-sm w-16 bg-base-100 border-base-300 px-2 text-center text-xs"
            />
            %
          </label>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="btn btn-sm btn-ghost border border-base-300 gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error alert-soft text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span className="break-words">{error}</span>
        </div>
      )}

      {loading && holdings.length === 0 ? (
        <div className="card card-border bg-base-200/50 p-8 sm:p-10 text-center text-sm text-base-content/50">
          <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
          <p className="mt-2">Reading token accounts…</p>
        </div>
      ) : holdings.length === 0 ? (
        <div className="card card-border bg-base-200/50 p-8 sm:p-10 text-center">
          <Coins className="w-6 h-6 text-base-content/40 mx-auto" />
          <p className="mt-3 text-sm text-base-content/60">No token balances in this wallet.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto rounded-box border border-base-300 bg-base-200/40">
            <table className="table table-sm w-full text-sm">
              <thead className="bg-base-300/40 text-[11px] uppercase tracking-wider text-base-content/50">
                <tr>
                  <th className="text-left font-medium px-4 py-2.5">Token</th>
                  <th className="text-right font-medium px-4 py-2.5">Balance</th>
                  <th className="text-right font-medium px-4 py-2.5">Value</th>
                  <th className="text-right font-medium px-4 py-2.5">Exit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-300/60">
                {holdings.map((h) => {
                  const state = sellState[h.mint] ?? "idle";
                  const busy = state === "signing" || state === "sending";
                  return (
                    <tr key={h.mint} className="hover">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-base-content">{h.symbol}</div>
                        <div className="text-[11px] text-base-content/50 truncate max-w-[160px]">
                          {h.name}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-base-content/80 font-mono">
                        {h.amountUi.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-base-content/80 font-mono">
                        {h.valueUsd == null
                          ? "—"
                          : `$${h.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {busy ? (
                            <span className="text-[11px] text-base-content/60 flex items-center gap-1.5">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                              {state === "signing" ? "Approve…" : "Sending…"}
                            </span>
                          ) : (
                            <div className="join">
                              {[0.25, 0.5, 1].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => sell(h, pct)}
                                  className="btn btn-xs btn-outline join-item text-[11px] hover:btn-error"
                                >
                                  {pct === 1 ? "Max" : `${pct * 100}%`}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {holdings.map((h) => {
              const state = sellState[h.mint] ?? "idle";
              const busy = state === "signing" || state === "sending";
              return (
                <div
                  key={h.mint}
                  className="card card-border bg-base-200/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-base-content">{h.symbol}</h4>
                      <p className="text-xs text-base-content/50 truncate max-w-[180px]">{h.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold font-mono text-base-content">
                        {h.valueUsd == null
                          ? "—"
                          : `$${h.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                      </span>
                      <span className="block text-[10px] text-base-content/40 uppercase">Est. Value</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-y border-base-300 text-xs">
                    <span className="text-base-content/50">Holding Balance</span>
                    <span className="font-mono font-medium text-base-content">
                      {h.amountUi.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-base-content/40 mb-1.5">
                      Market Exit:
                    </span>
                    {busy ? (
                      <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-base-300/40 text-xs text-base-content/70">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span>{state === "signing" ? "Approve in wallet…" : "Sending transaction…"}</span>
                      </div>
                    ) : (
                      <div className="join w-full">
                        {[0.25, 0.5, 1].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => sell(h, pct)}
                            className="btn btn-sm btn-outline join-item flex-1 text-xs hover:btn-error"
                          >
                            {pct === 1 ? "Exit 100%" : `Exit ${pct * 100}%`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="text-[11px] leading-relaxed text-base-content/40">
        Selling into a bonding curve moves the price against you, and the transaction is public
        the moment it lands. Anyone watching the coin can see the size of your position and your
        exit before and after.
      </p>
    </div>
  );
}
