// Global type declarations for viem
declare module 'viem' {
  export function createPublicClient(config: any): any;
  export function createWalletClient(config: any): any;
  export function http(url?: string): any;
  export function parseEther(value: string): bigint;
  export function recoverMessageAddress(params: {
    message: string;
    signature: `0x${string}`;
  }): `0x${string}`;
  export type Address = `0x${string}`;
  export type Hex = `0x${string}`;
  export type Chain = any;
  export type PublicClient = any;
  export type WalletClient = any;
  export type Transport = any;
}

declare module 'viem/accounts' {
  export function privateKeyToAccount(key: `0x${string}`): any;
}
