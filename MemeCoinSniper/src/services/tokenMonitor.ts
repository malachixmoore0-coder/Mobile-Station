import { TokenInfo, Platform, SniperConfig } from '../types';
import { analyzeToken, fetchTokenSafetyData } from './rugDetector';
import { PUMPFUN_WS } from '../utils/constants';

type TokenCallback = (token: TokenInfo) => void;

export class TokenMonitor {
  private callbacks: TokenCallback[] = [];
  private pumpFunWs: WebSocket | null = null;
  private raydiumPollInterval: ReturnType<typeof setInterval> | null = null;
  private seenMints = new Set<string>();
  private config: SniperConfig;
  private active = false;

  constructor(config: SniperConfig) {
    this.config = config;
  }

  updateConfig(config: SniperConfig) {
    this.config = config;
  }

  onToken(cb: TokenCallback) {
    this.callbacks.push(cb);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== cb);
    };
  }

  private emit(token: TokenInfo) {
    this.callbacks.forEach((cb) => cb(token));
  }

  start() {
    if (this.active) return;
    this.active = true;
    if (this.config.monitorPumpFun) this.connectPumpFun();
    if (this.config.monitorRaydium) this.startRaydiumPoll();
  }

  stop() {
    this.active = false;
    if (this.pumpFunWs) {
      this.pumpFunWs.close();
      this.pumpFunWs = null;
    }
    if (this.raydiumPollInterval) {
      clearInterval(this.raydiumPollInterval);
      this.raydiumPollInterval = null;
    }
  }

  private connectPumpFun() {
    try {
      this.pumpFunWs = new WebSocket(PUMPFUN_WS);

      this.pumpFunWs.onopen = () => {
        // Subscribe to new token creation events
        this.pumpFunWs?.send(
          JSON.stringify({ method: 'subscribeNewToken' })
        );
      };

      this.pumpFunWs.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.mint && !this.seenMints.has(msg.mint)) {
            this.seenMints.add(msg.mint);
            await this.processPumpFunToken(msg);
          }
        } catch {
          // ignore parse errors
        }
      };

      this.pumpFunWs.onclose = () => {
        if (this.active) {
          // Reconnect after 3s
          setTimeout(() => {
            if (this.active && this.config.monitorPumpFun) {
              this.connectPumpFun();
            }
          }, 3000);
        }
      };

      this.pumpFunWs.onerror = () => {
        this.pumpFunWs?.close();
      };
    } catch {
      // WebSocket may not be available
    }
  }

  private async processPumpFunToken(msg: Record<string, unknown>) {
    const mint = msg.mint as string;

    // Fetch safety data from DexScreener
    const safetyData = await fetchTokenSafetyData(mint);

    const partialToken: Partial<TokenInfo> = {
      mint,
      name: (msg.name as string) || 'Unknown',
      symbol: (msg.symbol as string) || '???',
      decimals: 6,
      logoUri: msg.image as string | undefined,
      platform: 'pumpfun' as Platform,
      createdAt: Date.now(),
      marketCap: (msg.marketCapSol as number) ? (msg.marketCapSol as number) * 150 : safetyData.marketCap,
      liquidity: safetyData.liquidity,
      price: safetyData.price,
      priceChange5m: safetyData.priceChange5m,
      volume5m: safetyData.volume5m,
      holders: msg.holderCount as number | undefined,
      isFrozen: false,
      hasLPBurned: (msg.raydiumPool as string) !== undefined,
      devHolding: typeof msg.devHolding === 'number' ? msg.devHolding : undefined,
      topHolderPct: typeof msg.topHolderPct === 'number' ? msg.topHolderPct : undefined,
    };

    const rugCheck = analyzeToken(partialToken);
    const token: TokenInfo = {
      ...(partialToken as TokenInfo),
      score: rugCheck.score,
    };

    this.emit(token);
  }

  private startRaydiumPoll() {
    // Poll Raydium for new AMM pools every 5 seconds
    let lastPoolId = '';

    const poll = async () => {
      if (!this.active) return;
      try {
        const res = await fetch(
          'https://api.raydium.io/v2/main/pairs?sortField=volume&sortType=desc&pageSize=10&page=1'
        );
        if (!res.ok) return;
        const data = await res.json();
        const pairs = data.data || [];

        for (const pair of pairs) {
          const mint = pair.baseMint as string;
          if (!mint || this.seenMints.has(mint)) continue;
          if (pair.ammId === lastPoolId) continue;

          // Only process very new pools (within last 10 minutes)
          const createdAt = pair.openTime ? (pair.openTime as number) * 1000 : Date.now();
          if (Date.now() - createdAt > 600_000) continue;

          this.seenMints.add(mint);
          lastPoolId = pair.ammId as string;

          const safetyData = await fetchTokenSafetyData(mint);
          const partialToken: Partial<TokenInfo> = {
            mint,
            name: (pair.name as string)?.split('-')[0] || 'Unknown',
            symbol: (pair.name as string)?.split('-')[0] || '???',
            decimals: 9,
            platform: 'raydium' as Platform,
            createdAt,
            liquidity: (pair.liquidity as number) || safetyData.liquidity,
            price: (pair.price as number) || safetyData.price,
            volume5m: safetyData.volume5m,
            isFrozen: false,
          };

          const rugCheck = analyzeToken(partialToken);
          const token: TokenInfo = {
            ...(partialToken as TokenInfo),
            score: rugCheck.score,
          };

          this.emit(token);
        }
      } catch {
        // ignore network errors
      }
    };

    poll();
    this.raydiumPollInterval = setInterval(poll, 5000);
  }
}
