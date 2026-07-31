// Wallet integration using wagmi + viem
import { createConfig, http, createStorage, cookieStorage } from 'wagmi';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';
import type { Address, Chain } from '../types';

// Monad Testnet chain config
export const monadTestnet: Chain = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
};

// Contract addresses - update after deployment
export const CONTRACTS = {
  BOUNTY_ESCROW: import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000' as Address,
} as const;

// BountyEscrow ABI (minimal)
export const BOUNTY_ESCROW_ABI = [
  {
    type: 'function',
    name: 'lockEscrow',
    stateMutability: 'payable',
    inputs: [
      { name: 'taskId', type: 'bytes32' },
      { name: 'rewardPerWorker', type: 'uint256' },
      { name: 'maxWorkers', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimPayment',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'taskId', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'refundRemaining',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'taskId', type: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getTaskEscrow',
    stateMutability: 'view',
    inputs: [{ name: 'taskId', type: 'bytes32' }],
    outputs: [
      { name: 'creator', type: 'address' },
      { name: 'rewardPerWorker', type: 'uint256' },
      { name: 'maxWorkers', type: 'uint256' },
      { name: 'totalLocked', type: 'uint256' },
      { name: 'totalReleased', type: 'uint256' },
      { name: 'cancelled', type: 'bool' },
    ],
  },
  {
    type: 'event',
    name: 'EscrowLocked',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'rewardPerWorker', type: 'uint256' },
      { name: 'maxWorkers', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'WorkerPaid',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true },
      { name: 'worker', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
    ],
  },
  {
    type: 'event',
    name: 'EscrowRefunded',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256' },
    ],
  },
] as const;

// SIWE (Sign-In with Ethereum) helpers
import { createWalletClient, custom } from 'viem';

export async function signInWithEthereum(address: Address): Promise<{ signature: string; message: string }> {
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
  const { nonce } = await authApi.getNonce(address);

  // Create SIWE message
  const message = `meteor.xyz wants you to sign in with your Ethereum account:\n${address}\n\nNonce: ${nonce}\n\nBy signing, you are proving you own this wallet and logging in. This does not initiate a transaction or cost any fees.`;

  // Sign message
  const signature = await walletClient.signMessage({ message });

  return { signature, message };
}

export { parseEther, formatEther } from 'viem';

// Wagmi config
export const wagmiConfig = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected(),
    metaMask(),
    walletConnect({ projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo' }),
  ],
  storage: createStorage({ storage: cookieStorage }),
  transports: {
    [monadTestnet.id]: http(),
  },
});