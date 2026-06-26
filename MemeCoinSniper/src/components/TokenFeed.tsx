import { useState } from 'react';
import { useSniper } from '../context/SniperContext';
import { TokenCard } from './TokenCard';
import { Platform } from '../types';

type FilterPlatform = Platform | 'all';
type SortKey = 'newest' | 'score' | 'liquidity' | 'mcap';

export function TokenFeed() {
  const { state } = useSniper();
  const { tokenFeed, status } = state;
  const [platform, setPlatform] = useState<FilterPlatform>('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [minScore, setMinScore] = useState(0);

  const filtered = tokenFeed
    .filter((t) => platform === 'all' || t.platform === platform)
    .filter((t) => t.score >= minScore)
    .sort((a, b) => {
      switch (sort) {
        case 'score': return b.score - a.score;
        case 'liquidity': return (b.liquidity || 0) - (a.liquidity || 0);
        case 'mcap': return (b.marketCap || 0) - (a.marketCap || 0);
        default: return b.createdAt - a.createdAt;
      }
    });

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-dark-600 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status === 'running' ? 'bg-accent-green animate-pulse-fast' : 'bg-gray-600'}`} />
          <h2 className="font-mono text-sm font-bold text-white">LIVE TOKEN FEED</h2>
          <span className="text-xs font-mono text-gray-500 bg-dark-700 px-1.5 py-0.5 rounded">
            {filtered.length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-2 border-b border-dark-600 flex flex-wrap gap-2 items-center">
        {/* Platform filter */}
        <div className="flex gap-1">
          {(['all', 'pumpfun', 'raydium', 'moonshot'] as FilterPlatform[]).map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                platform === p
                  ? 'bg-accent-purple/30 border border-accent-purple/60 text-accent-purple'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="h-3 w-px bg-dark-600" />

        {/* Sort */}
        <div className="flex gap-1">
          {(['newest', 'score', 'liquidity', 'mcap'] as SortKey[]).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${
                sort === s
                  ? 'bg-dark-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="h-3 w-px bg-dark-600" />

        {/* Min score */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-mono text-gray-500">score≥</span>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(parseInt(e.target.value) || 0)}
            className="w-12 bg-dark-700 border border-dark-500 rounded px-1 py-0.5 text-xs font-mono text-white focus:outline-none focus:border-accent-purple"
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto max-h-[600px] p-3 space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">{status === 'running' ? '🔍' : '⏸'}</div>
            <p className="font-mono text-gray-500 text-sm">
              {status === 'running'
                ? 'Scanning for new tokens...'
                : 'Start the sniper to monitor new launches'}
            </p>
          </div>
        )}
        {filtered.map((token) => (
          <TokenCard key={token.mint} token={token} />
        ))}
      </div>
    </div>
  );
}
