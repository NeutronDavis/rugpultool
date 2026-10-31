"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Clock } from "lucide-react";

interface CountdownRefreshProps {
  onRefresh: (forced?: boolean) => Promise<void>;
  isRefreshing: boolean;
  intervalSeconds?: number;
}

export function CountdownRefresh({
  onRefresh,
  isRefreshing,
  intervalSeconds = 60,
}: CountdownRefreshProps) {
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);

  const handleManualRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setSecondsLeft(intervalSeconds);
    await onRefresh(true);
  }, [isRefreshing, intervalSeconds, onRefresh]);

  useEffect(() => {
    if (isRefreshing) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Trigger auto-refresh
          onRefresh(false);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRefreshing, intervalSeconds, onRefresh]);

  // Reset timer whenever refresh finishes
  useEffect(() => {
    if (!isRefreshing) {
      setSecondsLeft(intervalSeconds);
    }
  }, [isRefreshing, intervalSeconds]);

  const progressPercent = ((intervalSeconds - secondsLeft) / intervalSeconds) * 100;

  return (
    <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 rounded-xl border border-base-300 bg-base-200/60 px-3 py-1.5 sm:px-3.5 sm:py-2">
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-base-content/50">
        <Clock className="w-3.5 h-3.5 text-base-content/40" />
        <span className="hidden xs:inline">Auto-refresh:</span>
        <span className="font-mono font-semibold text-base-content/80">
          {secondsLeft}s
        </span>
      </div>

      {/* Progress pill indicator */}
      <div className="hidden sm:block w-16 h-1.5 bg-base-300 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-success transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <button
        onClick={handleManualRefresh}
        disabled={isRefreshing}
        type="button"
        title="Refresh now"
        className="btn btn-xs sm:btn-sm btn-ghost border border-base-300 text-base-content/80 gap-1.5"
      >
        <RefreshCw
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary ${
            isRefreshing ? "animate-spin" : ""
          }`}
        />
        <span>{isRefreshing ? "Scanning..." : "Refresh"}</span>
      </button>
    </div>
  );
}
