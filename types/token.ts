export type TokenClassification = 'RUGGED' | 'HIGH_RISK';

export interface TokenRisk {
  name: string;
  level: 'danger' | 'warn' | 'info';
  description: string;
  score?: number;
  value?: string;
}

export interface RugToken {
  mint: string;
  name: string;
  symbol: string;
  priceUsd: number | null;
  liquidityUsd: number;
  volume24h: number;
  priceChange24h: number | null;
  pairCreatedAt: number | null;
  pairUrl: string;
  icon: string | null;
  classification: TokenClassification;
  riskScore: number;
  lpLockedPct: number;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  topHolderPct: number | null;
  risks: TokenRisk[];
  detectedAt: string;
}

export interface ScanStats {
  tokensScanned: number;
  ruggedCount: number;
  highRiskCount: number;
}

export interface ScanResponse {
  lastUpdated: string;
  stats: ScanStats;
  tokens: RugToken[];
}

export interface TokenDetailResponse {
  token: RugToken;
  rawRisks: TokenRisk[];
  topHolders: Array<{
    address: string;
    pct: number;
    amount: number;
    uiAmount?: number;
    insider?: boolean;
    owner?: string;
  }>;
  markets: Array<{
    pubkey?: string;
    lpLockedPct?: number;
    quotePrice?: number;
  }>;
}

// Third-party API types
export interface GeckoPoolAttribute {
  address: string;
  name: string;
  pool_created_at: string | null;
  fdv_usd: string | null;
  market_cap_usd: string | null;
  volume_usd?: {
    h24?: string;
  };
  reserve_in_usd?: string;
}

export interface GeckoPoolData {
  id: string;
  type: string;
  attributes: GeckoPoolAttribute;
  relationships?: {
    base_token?: {
      data?: {
        id: string;
        type: string;
      };
    };
  };
}

export interface DexScreenerProfile {
  url?: string;
  chainId: string;
  tokenAddress: string;
  icon?: string;
  header?: string;
  description?: string;
  links?: Array<{ label?: string; type?: string; url: string }>;
  openGraph?: string;
}

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative?: string;
  priceUsd?: string;
  txns?: {
    m5?: { buys: number; sells: number };
    h1?: { buys: number; sells: number };
    h6?: { buys: number; sells: number };
    h24?: { buys: number; sells: number };
  };
  volume?: {
    h24?: number;
    h6?: number;
    h1?: number;
    m5?: number;
  };
  priceChange?: {
    m5?: number;
    h1?: number;
    h6?: number;
    h24?: number;
  };
  liquidity?: {
    usd?: number;
    base?: number;
    quote?: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
  info?: {
    imageUrl?: string;
    header?: string;
    openGraph?: string;
    websites?: Array<{ label: string; url: string }>;
    socials?: Array<{ type: string; url: string }>;
  };
}

export interface RugCheckSummary {
  tokenProgram?: string;
  tokenType?: string;
  risks?: Array<{
    name: string;
    value?: string;
    description: string;
    score: number;
    level: 'danger' | 'warn' | 'info';
  }>;
  score?: number;
  score_normalised?: number;
  lpLockedPct?: number;
  rugged?: boolean;
}

export interface RugCheckReport extends RugCheckSummary {
  mint?: string;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  fileMeta?: {
    image?: string;
    name?: string;
    symbol?: string;
    description?: string;
  };
  tokenMeta?: {
    name?: string;
    symbol?: string;
    uri?: string;
  };
  topHolders?: Array<{
    address: string;
    amount: number;
    decimals: number;
    pct: number;
    uiAmount?: number;
    owner?: string;
    insider?: boolean;
  }>;
  markets?: Array<{
    pubkey?: string;
    lp?: {
      lpLockedPct?: number;
      quotePrice?: number;
      basePrice?: number;
      quoteUSD?: number;
      baseUSD?: number;
      lpLockedUSD?: number;
    };
  }>;
}
