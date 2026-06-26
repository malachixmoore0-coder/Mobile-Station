import { useSniper } from '../context/SniperContext';

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-mono text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
      {hint && <span className="text-xs text-gray-600">{hint}</span>}
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="bg-dark-700 border border-dark-500 rounded px-2 py-1.5 text-xs font-mono text-white w-full focus:border-accent-purple focus:outline-none"
    />
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${
        checked ? 'bg-accent-green' : 'bg-dark-500'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export function SniperConfig() {
  const { state, updateConfig } = useSniper();
  const { config } = state;

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4 space-y-5">
      <h2 className="font-mono text-sm font-bold text-white uppercase tracking-wider border-b border-dark-600 pb-2">
        Sniper Configuration
      </h2>

      {/* Buy Settings */}
      <div>
        <h3 className="font-mono text-xs text-accent-purple uppercase tracking-wider mb-3">
          Buy Settings
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Buy Amount (SOL)" hint="Per trade">
            <NumberInput
              value={config.buyAmountSol}
              onChange={(v) => updateConfig({ buyAmountSol: v })}
              min={0.001}
              max={100}
              step={0.01}
            />
          </Field>
          <Field label="Slippage %" hint="Default 10%">
            <NumberInput
              value={config.slippageBps / 100}
              onChange={(v) => updateConfig({ slippageBps: Math.round(v * 100) })}
              min={0.5}
              max={50}
              step={0.5}
            />
          </Field>
          <Field label="Priority Fee (SOL)" hint="Higher = faster">
            <NumberInput
              value={config.priorityFeeLamports / 1e9}
              onChange={(v) => updateConfig({ priorityFeeLamports: Math.round(v * 1e9) })}
              min={0}
              max={0.01}
              step={0.0001}
            />
          </Field>
          <Field label="Max Positions" hint="Open trades limit">
            <NumberInput
              value={config.maxPositions}
              onChange={(v) => updateConfig({ maxPositions: Math.round(v) })}
              min={1}
              max={20}
              step={1}
            />
          </Field>
          <Field label="Cooldown (ms)" hint="Between buys">
            <NumberInput
              value={config.cooldownMs}
              onChange={(v) => updateConfig({ cooldownMs: Math.round(v) })}
              min={500}
              max={30000}
              step={500}
            />
          </Field>
        </div>
      </div>

      {/* Filters */}
      <div>
        <h3 className="font-mono text-xs text-accent-purple uppercase tracking-wider mb-3">
          Filters
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Min Safety Score" hint="0–100">
            <NumberInput
              value={config.minSafetyScore}
              onChange={(v) => updateConfig({ minSafetyScore: v })}
              min={0}
              max={100}
              step={5}
            />
          </Field>
          <Field label="Max Market Cap ($)" hint="0 = any">
            <NumberInput
              value={config.maxMarketCapUsd}
              onChange={(v) => updateConfig({ maxMarketCapUsd: v })}
              min={0}
              step={10000}
            />
          </Field>
          <Field label="Min Liquidity ($)">
            <NumberInput
              value={config.minLiquidityUsd}
              onChange={(v) => updateConfig({ minLiquidityUsd: v })}
              min={0}
              step={1000}
            />
          </Field>
          <Field label="Max Dev Holding %" hint="Rug risk">
            <NumberInput
              value={config.maxDevHoldingPct}
              onChange={(v) => updateConfig({ maxDevHoldingPct: v })}
              min={0}
              max={100}
              step={5}
            />
          </Field>
          <Field label="Max Top Holder %" hint="Whale risk">
            <NumberInput
              value={config.maxTopHolderPct}
              onChange={(v) => updateConfig({ maxTopHolderPct: v })}
              min={0}
              max={100}
              step={5}
            />
          </Field>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs font-mono text-gray-400">Require LP Burned</span>
          <Toggle
            checked={config.requireLPBurned}
            onChange={(v) => updateConfig({ requireLPBurned: v })}
          />
        </div>
      </div>

      {/* Auto-sell */}
      <div>
        <h3 className="font-mono text-xs text-accent-purple uppercase tracking-wider mb-3">
          Auto-Sell
        </h3>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono text-gray-400">Enable Auto-Sell</span>
          <Toggle
            checked={config.autosell}
            onChange={(v) => updateConfig({ autosell: v })}
          />
        </div>
        {config.autosell && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Take Profit %" hint="E.g. 100 = 2x">
              <NumberInput
                value={config.takeProfitPct}
                onChange={(v) => updateConfig({ takeProfitPct: v })}
                min={5}
                max={10000}
                step={10}
              />
            </Field>
            <Field label="Stop Loss %" hint="E.g. -50 = half">
              <NumberInput
                value={config.stopLossPct}
                onChange={(v) => updateConfig({ stopLossPct: -Math.abs(v) })}
                min={-99}
                max={-1}
                step={5}
              />
            </Field>
          </div>
        )}
      </div>

      {/* Sources */}
      <div>
        <h3 className="font-mono text-xs text-accent-purple uppercase tracking-wider mb-3">
          Sources
        </h3>
        <div className="space-y-2">
          {[
            { key: 'monitorPumpFun', label: 'PumpFun', desc: 'New bonding curve tokens' },
            { key: 'monitorRaydium', label: 'Raydium', desc: 'New AMM pools' },
            { key: 'monitorMoonshot', label: 'Moonshot', desc: 'New launches (coming soon)' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-white">{label}</span>
                <span className="text-xs font-mono text-gray-500 ml-2">{desc}</span>
              </div>
              <Toggle
                checked={config[key as keyof typeof config] as boolean}
                onChange={(v) => updateConfig({ [key]: v })}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
