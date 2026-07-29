import { registerAs } from '@nestjs/config';

export default registerAs('monad', () => ({
  rpcUrl: process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz',
  chainId: parseInt(process.env.MONAD_CHAIN_ID || '10143', 10),
  escrowContractAddress: process.env.MONAD_ESCROW_CONTRACT_ADDRESS || '',
}));
