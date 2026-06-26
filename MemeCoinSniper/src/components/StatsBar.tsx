import { useSniper } from '../context/SniperContext';
import { formatUsd, formatPct, pnlColor } from '../utils/format';

function Stat({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-gray-500 text-xs font-mono">{label}</span>
      <span className={`text-sm font-mono font-bold ${colorClass || 'text-white'}`}>{value}</span>
    </div>
  );
}

export function StatsBar() {
  const { state } = useSniper();
  const { stats, positions, tokenFeed } = state;

  const openPositions = positions.filter((p) => p.status === 'open').length;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg px-4 py-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <Stat label="TOTAL TRADES" value={stats.totalTrades.toString()} />
      <Stat
        label="WIN RATE"
        value={stats.totalTrades > 0 ? formatPct(stats.winRate, false) : '--'}
        colorClass={stats.winRate >= 50 ? 'text-accent-green' : stats.winRate > 0 ? 'text-accent-yellow' : 'text-gray-400'}
      />
      <Stat
        label="TOTAL PNL"
        value={stats.totalTrades > 0 ? formatUsd(stats.totalPnlUsd) : '--'}
        colorClass={stats.totalTrades > 0 ? pnlColor(stats.totalPnlUsd) : 'text-gray-400'}
      />
      <Stat
        label="BEST TRADE"
        value={stats.bestTradePnl !== 0 ? formatPct(stats.bestTradePnl) : '--'}
        colorClass={stats.bestTradePnl > 0 ? 'text-accent-green' : 'text-gray-400'}
      />
      <Stat
        label="WORST TRADE"
        value={stats.worstTradePnl !== 0 ? formatPct(stats.worstTradePnl) : '--'}
        colorClass={stats.worstTradePnl < 0 ? 'text-accent-red' : 'text-gray-400'}
      />
      <Stat label="OPEN POSITIONS" value={openPositions.toString()} colorClass="text-accent-purple" />
      <Stat label="TOKENS SEEN" value={tokenFeed.length.toString()} colorClass="text-gray-300" />
    </div>
  );
}
