// Type declarations for viem
declare module 'viem' {
  export function createPublicClient<TChain extends Chain | undefined = undefined>(
    config: CreatePublicClientConfig<TChain>,
  ): PublicClient<TChain>;
  export function createWalletClient<TChain extends Chain | undefined = undefined>(
    config: CreateWalletClientConfig<TChain>,
  ): WalletClient<TChain>;
  export function http(url?: string): HttpTransport;
  export function parseEther(value: string): bigint;
  export function recoverMessageAddress(params: {
    message: string;
    signature: `0x${string}`;
  }): `0x${string}`;
  export type Address = `0x${string}`;
  export type Hex = `0x${string}`;
  export type Chain = import('@wagmi/core').Chain;
  export type PublicClient<TChain extends Chain | undefined = undefined> =
    import('viem').PublicClient<TChain>;
  export type WalletClient<TChain extends Chain | undefined = undefined> =
    import('viem').WalletClient<TChain>;
  export type Transport = import('viem').Transport;
}

declare module 'viem/accounts' {
  export function privateKeyToAccount(
    key: `0x${string}`,
  ): import('viem/accounts').PrivateKeyAccount;
}
