import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSniper } from '../context/SniperContext';
import { formatSol, formatUsd } from '../utils/format';

export function Header() {
  const { publicKey } = useWallet();
  const { state, startSniper, stopSniper } = useSniper();
  const { status, solBalance, solPriceUsd } = state;

  const isRunning = status === 'running';

  return (
    <header className="border-b border-dark-600 bg-dark-800/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-purple to-accent-green flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <div>
            <h1 className="font-mono font-bold text-white text-sm leading-none">
              MEME COIN SNIPER
            </h1>
            <p className="font-mono text-xs text-gray-500 leading-none mt-0.5">
              Phantom · Solana
            </p>
          </div>
        </div>

        {/* Status bar */}
        <div className="hidden md:flex items-center gap-6">
          {publicKey && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-gray-500">BAL </span>
                <span className="text-white">{formatSol(solBalance, 3)}</span>
                <span className="text-gray-500 ml-1">
                  ({formatUsd(solBalance * solPriceUsd)})
                </span>
              </div>
              <div>
                <span className="text-gray-500">SOL </span>
                <span className="text-white">{formatUsd(solPriceUsd)}</span>
              </div>
            </div>
          )}

          {/* Sniper toggle */}
          {publicKey && (
            <button
              onClick={isRunning ? stopSniper : startSniper}
              className={`
                px-4 py-1.5 rounded font-mono text-xs font-bold tracking-wider transition-all duration-200
                ${isRunning
                  ? 'bg-accent-red/20 border border-accent-red text-accent-red hover:bg-accent-red/30'
                  : 'bg-accent-green/20 border border-accent-green text-accent-green hover:bg-accent-green/30 animate-glow'
                }
              `}
            >
              {isRunning ? '⏹ STOP SNIPER' : '▶ START SNIPER'}
            </button>
          )}
        </div>

        <WalletMultiButton
          style={{
            height: 32,
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            background: 'linear-gradient(135deg, #9945ff20, #14f19520)',
            border: '1px solid #9945ff60',
            borderRadius: 6,
          }}
        />
      </div>
    </header>
  );
}
