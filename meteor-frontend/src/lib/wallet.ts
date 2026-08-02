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

  const walletClient = createWalletClient({
    account: address,
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });

  // Get nonce from backend
  const { authApi } = await import('../lib/api');
  const { nonce } = await authApi.getNonce({ address });

  // Create SIWE message
  const message = `meteor.xyz wants you to sign in with your Ethereum account:\n${address}\n\nNonce: ${nonce}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.`;

  // Sign message
  const signature = await walletClient.signMessage({ message });

  return { signature, message };
}

export { parseEther, formatEther } from 'viem';

// RainbowKit + Wagmi config - RainbowKit handles connectors internally
export const wagmiConfig = getDefaultConfig({
  appName: 'Meteor',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
  chains: [monadTestnet],
  ssr: false,
});