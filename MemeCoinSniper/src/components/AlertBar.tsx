import { useSniper } from '../context/SniperContext';
import { Alert } from '../types';

const alertStyles: Record<Alert['type'], string> = {
  success: 'border-accent-green/40 bg-accent-green/10 text-accent-green',
  error: 'border-accent-red/40 bg-accent-red/10 text-accent-red',
  warning: 'border-accent-yellow/40 bg-accent-yellow/10 text-accent-yellow',
  info: 'border-accent-blue/40 bg-accent-blue/10 text-accent-blue',
};

const alertIcons: Record<Alert['type'], string> = {
  success: '✓',
  error: '✗',
  warning: '⚠',
  info: 'ℹ',
};

export function AlertBar() {
  const { state, dismissAlert } = useSniper();
  const { alerts } = state;

  if (!alerts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {alerts.slice(0, 4).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center gap-2 px-3 py-2 rounded border font-mono text-xs animate-fade-in ${alertStyles[alert.type]}`}
        >
          <span className="font-bold">{alertIcons[alert.type]}</span>
          <span className="flex-1">{alert.message}</span>
          <button
            onClick={() => dismissAlert(alert.id)}
            className="opacity-60 hover:opacity-100 ml-2"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
