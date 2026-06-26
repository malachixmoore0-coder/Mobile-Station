import { TokenInfo } from '../types';

export interface RugCheckResult {
  score: number; // 0-100, higher is safer
  flags: string[];
  warnings: string[];
  passed: boolean;
}

// Heuristic safety scoring based on available token metadata
export function analyzeToken(token: Partial<TokenInfo>): RugCheckResult {
  const flags: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // Frozen mint (critical risk)
  if (token.isFrozen) {
    flags.push('Mint authority active — tokens can be frozen');
    score -= 30;
  }

  // LP not burned (high risk)
  if (token.hasLPBurned === false) {
    warnings.push('LP not burned — dev can rug liquidity');
    score -= 15;
  } else if (token.hasLPBurned) {
    score += 5;
  }

  // Dev holding too much
  if (token.devHolding !== undefined) {
    if (token.devHolding > 30) {
      flags.push(`Dev holds ${token.devHolding.toFixed(1)}% — extreme dump risk`);
      score -= 25;
    } else if (token.devHolding > 15) {
      warnings.push(`Dev holds ${token.devHolding.toFixed(1)}% — moderate risk`);
      score -= 12;
    } else if (token.devHolding > 5) {
      warnings.push(`Dev holds ${token.devHolding.toFixed(1)}%`);
      score -= 5;
    }
  }

  // Top holder concentration
  if (token.topHolderPct !== undefined) {
    if (token.topHolderPct > 50) {
      flags.push(`Top holder owns ${token.topHolderPct.toFixed(1)}% — whale dominance`);
      score -= 20;
    } else if (token.topHolderPct > 25) {
      warnings.push(`Top holder owns ${token.topHolderPct.toFixed(1)}%`);
      score -= 10;
    }
  }

  // Very low liquidity
  if (token.liquidity !== undefined) {
    if (token.liquidity < 1000) {
      flags.push(`Very low liquidity $${token.liquidity.toFixed(0)}`);
      score -= 20;
    } else if (token.liquidity < 5000) {
      warnings.push(`Low liquidity $${token.liquidity.toFixed(0)}`);
      score -= 8;
    }
  }

  // Holder count check
  if (token.holders !== undefined) {
    if (token.holders < 20) {
      warnings.push(`Very few holders: ${token.holders}`);
      score -= 10;
    } else if (token.holders < 100) {
      warnings.push(`Low holder count: ${token.holders}`);
      score -= 5;
    }
  }

  // Very high market cap on brand new token
  if (token.marketCap !== undefined && token.marketCap > 5_000_000) {
    warnings.push('High launch market cap — reduced upside');
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    flags,
    warnings,
    passed: score >= 40 && flags.length === 0,
  };
}

// Simulate rug check using DexScreener data
export async function fetchTokenSafetyData(mint: string): Promise<Partial<TokenInfo>> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`
    );
    if (!res.ok) return {};
    const data = await res.json();
    const pair = data.pairs?.[0];
    if (!pair) return {};

    return {
      liquidity: pair.liquidity?.usd ?? 0,
      marketCap: pair.marketCap ?? 0,
      priceChange5m: pair.priceChange?.m5 ?? 0,
      volume5m: pair.volume?.m5 ?? 0,
      price: pair.priceUsd ? parseFloat(pair.priceUsd) : 0,
    };
  } catch {
    return {};
  }
}
