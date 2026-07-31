// Deploy configuration for BountyEscrow
// Usage: npx ts-node scripts/deploy.ts --network monad-testnet

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  explorer: string;
  currency: string;
}

export interface DeployConfig {
  networks: Record<string, NetworkConfig>;
  defaultNetwork: string;
  contract: {
    name: string;
    source: string;
  };
}

export const deployConfig: DeployConfig = {
  networks: {
    'monad-testnet': {
      name: 'Monad Testnet',
      rpcUrl: 'https://testnet-rpc.monad.xyz',
      chainId: 10143,
      explorer: 'https://testnet.monadexplorer.com',
      currency: 'MON',
    },
    'monad-mainnet': {
      name: 'Monad Mainnet',
      rpcUrl: 'https://rpc.monad.xyz',
      chainId: 10143,
      explorer: 'https://monadexplorer.com',
      currency: 'MON',
    },
    local: {
      name: 'Anvil Local',
      rpcUrl: 'http://localhost:8545',
      chainId: 31337,
      explorer: '',
      currency: 'ETH',
    },
  },
  defaultNetwork: 'monad-testnet',
  contract: {
    name: 'BountyEscrow',
    source: 'src/BountyEscrow.sol',
  },
};

export function getNetworkConfig(network?: string): NetworkConfig {
  const net = network || deployConfig.defaultNetwork;
  const config = deployConfig.networks[net];
  if (!config) {
    throw new Error(`Unknown network: ${net}`);
  }
  return config;
}