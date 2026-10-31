"use client";

import { useState } from "react";
import Image from "next/image";

interface CoinLogoProps {
  src: string | null | undefined;
  symbol: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

// Generate a deterministic gradient color for coins without an image
function getGradientFromSymbol(symbol: string): string {
  const gradients = [
    "from-purple-600 via-indigo-600 to-blue-500",
    "from-emerald-500 via-teal-600 to-cyan-500",
    "from-rose-500 via-pink-600 to-amber-500",
    "from-amber-500 via-orange-600 to-yellow-500",
    "from-violet-600 via-purple-700 to-fuchsia-600",
    "from-cyan-500 via-blue-600 to-indigo-600",
    "from-lime-500 via-emerald-600 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = (hash << 5) - hash + symbol.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export function CoinLogo({
  src,
  symbol,
  name,
  size = "md",
  className = "",
}: CoinLogoProps) {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-9 h-9 text-xs",
    lg: "w-12 h-12 text-sm",
  }[size];

  const imgPx = {
    sm: 28,
    md: 36,
    lg: 48,
  }[size];

  const cleanSymbol = (symbol || "COIN").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "?";
  const gradient = getGradientFromSymbol(symbol || name || "SOL");

  return (
    <div
      className={`relative rounded-xl overflow-hidden shrink-0 border border-zinc-700/60 shadow-sm bg-zinc-900 flex items-center justify-center font-bold tracking-tight select-none ${sizeClasses} ${className}`}
      title={name ? `${name} ($${symbol})` : `$${symbol}`}
    >
      {src && !hasError ? (
        <Image
          src={src}
          alt={symbol || "Token Logo"}
          width={imgPx}
          height={imgPx}
          unoptimized
          className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
          onError={() => setHasError(true)}
        />
      ) : (
        <div
          className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-extrabold shadow-inner`}
        >
          {cleanSymbol.slice(0, 2)}
        </div>
      )}
    </div>
  );
}
