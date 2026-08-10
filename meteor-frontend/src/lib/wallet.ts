// Wallet integration using wagmi + RainbowKit + viem
import { createConfig, http, createStorage, cookieStorage } from 'wagmi'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { monadTestnet } from './chains'

// Contract addresses - update after deployment
export const CONTRACTS = {
  BOUNTY_ESCROW: (import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`,
} as const;

// SIWE (Sign-In with Ethereum) helpers
import { createWalletClient, custom } from 'viem';

export async function signInWithEthereum(address: `0x${string}`): Promise<{ signature: string; message: string }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('No wallet detected');
  }

  // Get nonce from backend
  const { authApi } = await import('../lib/api');
  
  console.log('[signInWithEthereum] Requesting nonce for:', address);
  const nonceResponse = await authApi.getNonce({ address });
  console.log('[signInWithEthereum] Nonce response:', nonceResponse);
  
  // Backend returns wrapped response: {statusCode, message, data: {nonce, walletAddress}, ...}
  const nonce = nonceResponse?.data?.nonce;
  if (!nonce) {
    console.error('[signInWithEthereum] No nonce in response data:', nonceResponse);
    throw new Error('Failed to get nonce from backend');
  }

  // Create SIWE message
  const message = `meteor.xyz wants you to sign in with your Ethereum account:\n${address}\n\nNonce: ${nonce}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.`;

  console.log('[signInWithEthereum] SIWE message:', message);

  // Sign message
  const walletClient = createWalletClient({
    account: address,
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });

  const signature = await walletClient.signMessage({ message });

  return { signature, message };
}

export interface SiweAuthResult {
  accessToken: string;
  refreshToken?: string;
  user: { id: string; username?: string; walletAddress: string; reputation?: number };
}

// Single-flight SIWE login: exactly ONE nonce request + signature + verify per wallet,
// shared by ApiClient's silent re-auth AND the wallet-connect flow. Prevents the two
// flows from overwriting each other's nonce (which caused "Signature does not match").
let siweAuthPromise: { address: string; promise: Promise<SiweAuthResult | null> } | null = null;

export function siweLogin(address: `0x${string}`): Promise<SiweAuthResult | null> {
  if (siweAuthPromise?.address === address) return siweAuthPromise.promise;
  const promise = doSiweLogin(address);
  siweAuthPromise = { address, promise };
  promise.finally(() => {
    if (siweAuthPromise?.address === address) siweAuthPromise = null;
  });
  return promise;
}

async function doSiweLogin(address: `0x${string}`): Promise<SiweAuthResult | null> {
  try {
    const { authApi, api } = await import('../lib/api');
    const { signature } = await signInWithEthereum(address);
    const verifyResponse = await authApi.verify({ address, signature, nonce: '' });
    const data = verifyResponse?.data as SiweAuthResult | undefined;
    if (!data?.accessToken) return null;
    api.setToken(data.accessToken);
    if (data.refreshToken && typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data;
  } catch (error) {
    console.error('[siweLogin] Failed:', error);
    return null;
  }
}

export { parseEther, formatEther } from 'viem';

// RainbowKit + Wagmi config - RainbowKit handles connectors internally
export const wagmiConfig = getDefaultConfig({
  appName: 'Meteor',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [monadTestnet],
  ssr: false,
});