import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const MONAD_CHAIN = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 } as const,
  rpcUrls: { default: { http: [''] } } as const,
};

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private readonly publicClient;
  private readonly walletClient;
  private readonly escrowContractAddress: string;
  private readonly chainId: number;

  constructor(private readonly configService: ConfigService) {
    this.chainId = this.configService.get<number>('monad.chainId', 10143);
    this.escrowContractAddress = this.configService.get<string>('monad.escrowContractAddress', '');

    const rpcUrl = this.configService.get<string>('monad.rpcUrl', 'https://testnet-rpc.monad.xyz');

    const chain = { ...MONAD_CHAIN, id: this.chainId, rpcUrls: { default: { http: [rpcUrl] } } };

    this.publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    const privateKey = this.configService.get<string>('monad.escrowPrivateKey');
    if (privateKey) {
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      this.walletClient = createWalletClient({
        account,
        chain,
        transport: http(),
      });
    }
  }

  async createEscrow(
    taskId: string,
    workerAddress: string,
    amount: string,
  ): Promise<{ txHash: string }> {
    this.logger.log(
      `Creating escrow for task ${taskId}, worker ${workerAddress}, amount ${amount}`,
    );

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
      value: parseEther(amount),
    });

    return { txHash: hash };
  }

  async releaseFunds(escrowId: string, submissionId: string): Promise<{ txHash: string }> {
    this.logger.log(`Releasing funds for escrow ${escrowId}, submission ${submissionId}`);

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
    });

    return { txHash: hash };
  }

  async refundEscrow(escrowId: string, reason: string): Promise<{ txHash: string }> {
    this.logger.log(`Refunding escrow ${escrowId}, reason: ${reason}`);

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
    });

    return { txHash: hash };
  }

  async verifyTransaction(
    txHash: string,
  ): Promise<{ confirmed: boolean; blockNumber: bigint | null }> {
    this.logger.log(`Verifying transaction ${txHash}`);

    const receipt = await this.publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    return {
      confirmed: receipt.status === 'success',
      blockNumber: receipt.blockNumber,
    };
  }

  async getTransactionStatus(txHash: string): Promise<{ status: string; confirmations: number }> {
    this.logger.log(`Getting transaction status for ${txHash}`);

    const receipt = await this.publicClient.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

    const currentBlock = await this.publicClient.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    return {
      status: receipt.status === 'success' ? 'confirmed' : 'failed',
      confirmations: Math.max(0, confirmations),
    };
  }
}
