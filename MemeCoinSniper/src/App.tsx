import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { SniperConfig } from './components/SniperConfig';
import { TokenFeed } from './components/TokenFeed';
import { PositionManager } from './components/PositionManager';
import { TransactionLog } from './components/TransactionLog';
import { AlertBar } from './components/AlertBar';
import { WalletRequired } from './components/WalletRequired';
import { useSniper } from './context/SniperContext';

type Tab = 'feed' | 'positions' | 'log';

export function App() {
  const { connected } = useWallet();
  const { state, startSniper, stopSniper } = useSniper();
  const { status } = state;
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  const isRunning = status === 'running';

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {!connected ? (
          <WalletRequired />
        ) : (
          <>
            {/* Mobile sniper button */}
            <div className="md:hidden">
              <button
                onClick={isRunning ? stopSniper : startSniper}
                className={`w-full py-3 rounded-lg font-mono font-bold text-sm tracking-wider transition-all ${
                  isRunning
                    ? 'bg-accent-red/20 border border-accent-red text-accent-red'
                    : 'bg-accent-green/20 border border-accent-green text-accent-green'
                }`}
              >
                {isRunning ? '⏹ STOP SNIPER' : '▶ START SNIPER'}
              </button>
            </div>

            <StatsBar />

            {/* Warning banner */}
            <div className="bg-accent-yellow/10 border border-accent-yellow/30 rounded-lg px-4 py-2 font-mono text-xs text-accent-yellow">
              ⚠ Trading meme coins is extremely high risk. Never invest more than you can afford to lose.
              Always verify contracts before buying. This tool does not guarantee profits.
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Config panel */}
              <div className="lg:col-span-1">
                <SniperConfig />
              </div>

              {/* Right panel — tabbed on mobile */}
              <div className="lg:col-span-2 space-y-4">
                {/* Tab switcher (mobile only) */}
                <div className="flex lg:hidden border border-dark-600 rounded-lg overflow-hidden">
                  {(['feed', 'positions', 'log'] as Tab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                        activeTab === tab
                          ? 'bg-accent-purple/20 text-accent-purple'
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Desktop: show all. Mobile: show active tab */}
                <div className={activeTab === 'feed' ? 'block' : 'hidden lg:block'}>
                  <TokenFeed />
                </div>
                <div className={activeTab === 'positions' ? 'block' : 'hidden lg:block'}>
                  <PositionManager />
                </div>
                <div className={activeTab === 'log' ? 'block' : 'hidden lg:block'}>
                  <TransactionLog />
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <AlertBar />
    </div>
  );
}
