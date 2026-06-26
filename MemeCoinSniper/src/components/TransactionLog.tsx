import { useSniper } from '../context/SniperContext';
import { formatAddress, formatSol, formatTimestamp, pnlColor, formatPct } from '../utils/format';

export function TransactionLog() {
  const { state } = useSniper();
  const { transactions } = state;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-600">
        <h2 className="font-mono text-sm font-bold text-white">
          TRANSACTION LOG
          <span className="ml-2 text-xs text-gray-500">{transactions.length} total</span>
        </h2>
      </div>

      <div className="divide-y divide-dark-600 max-h-64 overflow-y-auto">
        {transactions.length === 0 && (
          <p className="text-center py-6 font-mono text-gray-500 text-sm">No transactions yet</p>
        )}
        {transactions.map((tx) => (
          <div key={tx.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-dark-700 transition-colors">
            {/* Type badge */}
            <span
              className={`text-xs font-mono font-bold w-12 text-center px-1 py-0.5 rounded ${
                tx.type === 'buy'
                  ? 'text-accent-green bg-accent-green/10'
                  : tx.type === 'sell'
                  ? 'text-accent-blue bg-accent-blue/10'
                  : 'text-accent-red bg-accent-red/10'
              }`}
            >
              {tx.type.toUpperCase()}
            </span>

            {/* Token */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-xs">{tx.token.symbol}</span>
                <span className="font-mono text-gray-500 text-xs truncate">{tx.token.name}</span>
              </div>
              {tx.error && (
                <div className="font-mono text-accent-red text-xs truncate">{tx.error}</div>
              )}
            </div>

            {/* Amount */}
            <div className="text-right">
              <div className="font-mono text-xs text-white">{formatSol(tx.amountSol)}</div>
              {tx.pnlPct !== undefined && (
                <div className={`font-mono text-xs ${pnlColor(tx.pnlPct)}`}>
                  {formatPct(tx.pnlPct)}
                </div>
              )}
            </div>

            {/* Time + link */}
            <div className="text-right min-w-[80px]">
              <div className="font-mono text-xs text-gray-500">{formatTimestamp(tx.timestamp)}</div>
              {tx.txSignature && (
                <a
                  href={`https://solscan.io/tx/${tx.txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-gray-600 hover:text-accent-purple transition-colors"
                >
                  {formatAddress(tx.txSignature, 3)}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
