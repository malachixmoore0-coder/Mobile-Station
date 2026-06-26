import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletRequired() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
      <div className="text-6xl">👻</div>
      <div className="text-center">
        <h2 className="font-mono font-bold text-white text-xl mb-2">Connect Phantom Wallet</h2>
        <p className="font-mono text-gray-500 text-sm max-w-sm">
          Connect your Phantom wallet to start sniping meme coins on Solana.
          Your private keys never leave your wallet.
        </p>
      </div>

      <WalletMultiButton
        style={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono, monospace',
          background: 'linear-gradient(135deg, #9945ff, #14f195)',
          border: 'none',
          borderRadius: 8,
          padding: '10px 24px',
        }}
      />

      <div className="grid grid-cols-3 gap-4 max-w-lg text-center">
        {[
          { icon: '⚡', title: 'Lightning Fast', desc: 'Sub-second execution via Jupiter V6' },
          { icon: '🛡', title: 'Rug Detection', desc: 'Safety scoring on every token' },
          { icon: '🤖', title: 'Fully Automated', desc: 'Auto-buy, TP and SL on autopilot' },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="bg-dark-800 border border-dark-600 rounded-lg p-4">
            <div className="text-2xl mb-2">{icon}</div>
            <h3 className="font-mono font-bold text-white text-xs mb-1">{title}</h3>
            <p className="font-mono text-gray-500 text-xs">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
