import { useSniper } from '../context/SniperContext';
import { Position } from '../types';
import { formatAddress, formatSol, formatUsd, formatPct, formatTimestamp, pnlColor } from '../utils/format';

function PositionRow({ position }: { position: Position }) {
  const { manualSell } = useSniper();
  const isOpen = position.status === 'open';

  return (
    <div className={`border rounded-lg p-3 transition-all ${
      isOpen ? 'border-accent-purple/30 bg-dark-700' : 'border-dark-600 bg-dark-800 opacity-60'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-purple/40 to-accent-green/40 flex items-center justify-center text-xs font-bold text-white">
            {position.token.symbol.slice(0, 2)}
          </div>
          <div>
            <span className="font-mono font-bold text-white text-sm">{position.token.symbol}</span>
            <span className="font-mono text-gray-500 text-xs ml-2">{position.token.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded border ${
              isOpen
                ? 'border-accent-green/40 bg-accent-green/10 text-accent-green'
                : position.status === 'sold'
                ? 'border-gray-500/40 bg-gray-500/10 text-gray-400'
                : 'border-accent-red/40 bg-accent-red/10 text-accent-red'
            }`}
          >
            {position.status.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-2">
        <div>
          <span className="text-gray-500">INVESTED </span>
          <span className="text-white">{formatSol(position.buyPriceSol)}</span>
        </div>
        <div>
          <span className="text-gray-500">VALUE </span>
          <span className="text-white">{formatUsd(position.buyPriceUsd)}</span>
        </div>
        <div>
          <span className="text-gray-500">OPENED </span>
          <span className="text-white">{formatTimestamp(position.openedAt)}</span>
        </div>
        {position.pnlPct !== undefined && (
          <>
            <div>
              <span className="text-gray-500">PNL% </span>
              <span className={pnlColor(position.pnlPct)}>
                {formatPct(position.pnlPct)}
              </span>
            </div>
            <div>
              <span className="text-gray-500">PNL$ </span>
              <span className={pnlColor(position.pnlUsd || 0)}>
                {formatUsd(position.pnlUsd || 0)}
              </span>
            </div>
          </>
        )}
        <div>
          <span className="text-gray-500">TP </span>
          <span className="text-accent-green">+{position.takeProfitAt.toFixed(0)}%</span>
          <span className="text-gray-600 mx-1">/</span>
          <span className="text-gray-500">SL </span>
          <span className="text-accent-red">{position.stopLossAt.toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={`https://solscan.io/tx/${position.buyTxSig}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-gray-500 hover:text-accent-purple transition-colors"
        >
          buy: {formatAddress(position.buyTxSig)}
        </a>
        {isOpen && (
          <button
            onClick={() => manualSell(position)}
            className="text-xs font-mono px-3 py-1 rounded border border-accent-red/40 bg-accent-red/10 text-accent-red hover:bg-accent-red/20 transition-colors"
          >
            SELL NOW
          </button>
        )}
        {position.sellTxSig && (
          <a
            href={`https://solscan.io/tx/${position.sellTxSig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-gray-500 hover:text-accent-purple transition-colors"
          >
            sell: {formatAddress(position.sellTxSig)}
          </a>
        )}
      </div>
    </div>
  );
}

export function PositionManager() {
  const { state } = useSniper();
  const { positions } = state;

  const open = positions.filter((p) => p.status === 'open');
  const closed = positions.filter((p) => p.status !== 'open');

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-dark-600">
        <h2 className="font-mono text-sm font-bold text-white">
          POSITIONS
          <span className="ml-2 text-xs font-mono text-gray-500">
            {open.length} open · {closed.length} closed
          </span>
        </h2>
      </div>

      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">
        {positions.length === 0 && (
          <p className="text-center py-8 font-mono text-gray-500 text-sm">
            No positions yet
          </p>
        )}
        {open.map((p) => (
          <PositionRow key={p.id} position={p} />
        ))}
        {closed.map((p) => (
          <PositionRow key={p.id} position={p} />
        ))}
      </div>
    </div>
  );
}
