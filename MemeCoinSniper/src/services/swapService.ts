import {
  Connection,
  PublicKey,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { TokenInfo, SniperConfig } from '../types';
import { SOL_MINT, JUPITER_API } from '../utils/constants';

export interface SwapResult {
  success: boolean;
  txSignature?: string;
  error?: string;
  amountOut?: number;
  priceImpact?: number;
}

export interface QuoteResult {
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  routePlan: unknown[];
}

// Fetch a swap quote from Jupiter V6
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amountLamports: number,
  slippageBps: number
): Promise<QuoteResult | null> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountLamports.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false',
    });

    const res = await fetch(`${JUPITER_API}/quote?${params}`);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.outAmount) return null;

    return {
      inAmount: parseInt(data.inAmount),
      outAmount: parseInt(data.outAmount),
      priceImpactPct: parseFloat(data.priceImpactPct || '0'),
      routePlan: data.routePlan || [],
    };
  } catch {
    return null;
  }
}

// Build a swap transaction via Jupiter and send via Phantom
export async function executeSwap(
  connection: Connection,
  wallet: { publicKey: PublicKey; signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction> },
  token: TokenInfo,
  config: SniperConfig,
  direction: 'buy' | 'sell',
  tokenAmount?: number
): Promise<SwapResult> {
  try {
    const inputMint = direction === 'buy' ? SOL_MINT : token.mint;
    const outputMint = direction === 'buy' ? token.mint : SOL_MINT;
    const amountLamports =
      direction === 'buy'
        ? Math.floor(config.buyAmountSol * LAMPORTS_PER_SOL)
        : tokenAmount || 0;

    if (amountLamports <= 0) {
      return { success: false, error: 'Invalid amount' };
    }

    // Get quote
    const quote = await getJupiterQuote(
      inputMint,
      outputMint,
      amountLamports,
      config.slippageBps
    );

    if (!quote) {
      return { success: false, error: 'Could not get swap quote from Jupiter' };
    }

    // Get swap transaction
    const swapRes = await fetch(`${JUPITER_API}/swap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: wallet.publicKey.toString(),
        wrapAndUnwrapSol: true,
        computeUnitPriceMicroLamports: config.priorityFeeLamports,
        asLegacyTransaction: false,
      }),
    });

    if (!swapRes.ok) {
      const err = await swapRes.text();
      return { success: false, error: `Jupiter swap error: ${err}` };
    }

    const { swapTransaction } = await swapRes.json();
    if (!swapTransaction) {
      return { success: false, error: 'No swap transaction returned' };
    }

    // Deserialize the transaction
    const txBuffer = Buffer.from(swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuffer);

    // Sign via Phantom
    const signedTx = await wallet.signTransaction(transaction);

    // Send the transaction
    const txSignature = await connection.sendRawTransaction(
      signedTx.serialize(),
      {
        skipPreflight: true,
        maxRetries: 3,
      }
    );

    // Wait for confirmation
    const { value } = await connection.confirmTransaction(
      { signature: txSignature, ...(await connection.getLatestBlockhash()) },
      'confirmed'
    );

    if (value.err) {
      return { success: false, error: `Transaction failed: ${JSON.stringify(value.err)}`, txSignature };
    }

    return {
      success: true,
      txSignature,
      amountOut: quote.outAmount,
      priceImpact: quote.priceImpactPct,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      // User rejected the transaction
      if (err.message.includes('User rejected')) {
        return { success: false, error: 'Transaction rejected by user' };
      }
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Unknown error during swap' };
  }
}

// Get SOL balance for a wallet
export async function getSolBalance(
  connection: Connection,
  publicKey: PublicKey
): Promise<number> {
  try {
    const lamports = await connection.getBalance(publicKey);
    return lamports / LAMPORTS_PER_SOL;
  } catch {
    return 0;
  }
}

// Get token balance
export async function getTokenBalance(
  connection: Connection,
  walletPubkey: PublicKey,
  tokenMint: string
): Promise<number> {
  try {
    const mintPubkey = new PublicKey(tokenMint);
    const accounts = await connection.getParsedTokenAccountsByOwner(walletPubkey, {
      mint: mintPubkey,
    });
    if (!accounts.value.length) return 0;
    const info = accounts.value[0].account.data.parsed.info;
    return info.tokenAmount.uiAmount || 0;
  } catch {
    return 0;
  }
}
