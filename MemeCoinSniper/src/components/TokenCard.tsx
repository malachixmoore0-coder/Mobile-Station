import { TokenInfo } from '../types';
import {
  formatAddress,
  formatTimestamp,
  formatUsd,
  formatPct,
  scoreColor,
  formatNumber,
} from '../utils/format';
import { analyzeToken } from '../services/rugDetector';
import { useSniper } from '../context/SniperContext';
import { useWallet } from '@solana/wallet-adapter-react';

const platformBadge: Record<string, string> = {
  pumpfun: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
  raydium: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  moonshot: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  unknown: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

export function TokenCard({ token }: { token: TokenInfo }) {
  const { manualBuy } = useSniper();
  const { connected } = useWallet();
  const rugCheck = analyzeToken(token);

  return (
    <div className="bg-dark-800 border border-dark-600 hover:border-dark-500 rounded-lg p-3 transition-all animate-fade-in">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {token.logoUri ? (
            <img
              src={token.logoUri}
              alt={token.symbol}
              className="w-7 h-7 rounded-full bg-dark-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-purple/40 to-accent-green/40 flex items-center justify-center text-xs font-bold text-white">
              {token.symbol.slice(0, 2)}
            </div>
          )}
          <div>
            <div className="font-mono font-bold text-white text-sm">{token.symbol}</div>
            <div className="font-mono text-gray-500 text-xs">{token.name}</div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={`text-xs font-mono px-1.5 py-0.5 rounded border ${platformBadge[token.platform]}`}
          >
            {token.platform.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500 font-mono">{formatTimestamp(token.createdAt)}</span>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mb-2 text-xs font-mono">
        <div>
          <span className="text-gray-500">MCAP </span>
          <span className="text-white">
            {token.marketCap ? formatUsd(token.marketCap) : '--'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">LIQ </span>
          <span className="text-white">
            {token.liquidity ? formatUsd(token.liquidity) : '--'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">5m </span>
          <span
            className={
              token.priceChange5m !== undefined
                ? token.priceChange5m >= 0
                  ? 'text-accent-green'
                  : 'text-accent-red'
                : 'text-gray-400'
            }
          >
            {token.priceChange5m !== undefined ? formatPct(token.priceChange5m) : '--'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">HOL </span>
          <span className="text-white">
            {token.holders !== undefined ? formatNumber(token.holders) : '--'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">DEV </span>
          <span
            className={
              token.devHolding !== undefined
                ? token.devHolding > 20
                  ? 'text-accent-red'
                  : 'text-accent-yellow'
                : 'text-gray-400'
            }
          >
            {token.devHolding !== undefined ? `${token.devHolding.toFixed(1)}%` : '--'}
          </span>
        </div>
        <div>
          <span className="text-gray-500">LP </span>
          <span
            className={
              token.hasLPBurned === true
                ? 'text-accent-green'
                : token.hasLPBurned === false
                ? 'text-accent-red'
                : 'text-gray-400'
            }
          >
            {token.hasLPBurned === true ? 'BURNED' : token.hasLPBurned === false ? 'OPEN' : '--'}
          </span>
        </div>
      </div>

      {/* Safety score + warnings */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 bg-dark-700 rounded-full h-1.5">
          <div
            className={`h-full rounded-full transition-all ${
              rugCheck.score >= 70
                ? 'bg-accent-green'
                : rugCheck.score >= 40
                ? 'bg-accent-yellow'
                : 'bg-accent-red'
            }`}
            style={{ width: `${rugCheck.score}%` }}
          />
        </div>
        <span className={`text-xs font-mono font-bold ${scoreColor(rugCheck.score)}`}>
          {rugCheck.score}
        </span>
      </div>

      {rugCheck.flags.length > 0 && (
        <div className="text-xs font-mono text-accent-red mb-2 truncate">
          ⚠ {rugCheck.flags[0]}
        </div>
      )}
      {rugCheck.flags.length === 0 && rugCheck.warnings.length > 0 && (
        <div className="text-xs font-mono text-accent-yellow mb-2 truncate">
          ! {rugCheck.warnings[0]}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <a
          href={`https://solscan.io/token/${token.mint}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-gray-500 hover:text-accent-purple transition-colors"
        >
          {formatAddress(token.mint)}
        </a>
        <div className="flex items-center gap-2">
          <a
            href={`https://dexscreener.com/solana/${token.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-gray-500 hover:text-accent-blue transition-colors"
          >
            chart
          </a>
          {connected && (
            <button
              onClick={() => manualBuy(token)}
              className="text-xs font-mono px-2 py-0.5 rounded border border-accent-green/40 bg-accent-green/10 text-accent-green hover:bg-accent-green/20 transition-colors"
            >
              BUY
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
