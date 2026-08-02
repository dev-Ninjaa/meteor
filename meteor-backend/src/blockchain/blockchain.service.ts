import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { encodeFunctionData } from 'viem/utils'
import { privateKeyToAccount } from 'viem/accounts'

const ESCROW_ABI = [
  {
    type: 'function',
    name: 'lockEscrow',
    stateMutability: 'payable',
    inputs: [
      { name: 'taskId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'rewardPerWorker', type: 'uint256', internalType: 'uint256' },
      { name: 'maxWorkers', type: 'uint256', internalType: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'releaseEscrow',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'taskId', type: 'bytes32', internalType: 'bytes32' },
      { name: 'submissionId', type: 'bytes32', internalType: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'refundRemaining',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'taskId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'claimPayment',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'taskId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getTaskEscrow',
    stateMutability: 'view',
    inputs: [{ name: 'taskId', type: 'bytes32', internalType: 'bytes32' }],
    outputs: [
      { name: 'creator', type: 'address', internalType: 'address' },
      { name: 'rewardPerWorker', type: 'uint256', internalType: 'uint256' },
      { name: 'maxWorkers', type: 'uint256', internalType: 'uint256' },
      { name: 'totalLocked', type: 'uint256', internalType: 'uint256' },
      { name: 'totalReleased', type: 'uint256', internalType: 'uint256' },
      { name: 'cancelled', type: 'bool', internalType: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'getContractBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
  },
] as const

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
    rewardPerWorker: string,
    maxWorkers: string,
    amount: string,
  ): Promise<{ txHash: string }> {
    this.logger.log(
      `Creating escrow for task ${taskId}, rewardPerWorker ${rewardPerWorker}, maxWorkers ${maxWorkers}, amount ${amount}`,
    );

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const taskIdBytes32 = taskId as `0x${string}`;
    const rewardPerWorkerWei = parseEther(rewardPerWorker);
    const maxWorkersBigInt = BigInt(maxWorkers);

    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'lockEscrow',
      args: [taskIdBytes32, rewardPerWorkerWei, BigInt(maxWorkers)],
    });

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
      value: parseEther(amount),
      data,
    });

    return { txHash: hash };
  }

  async releaseFunds(
    taskId: string,
    submissionId: string,
  ): Promise<{ txHash: string }> {
    this.logger.log(`Releasing funds for task ${taskId}, submission ${submissionId}`);

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'releaseEscrow',
      args: [taskId as `0x${string}`, submissionId as `0x${string}`],
    });

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
      data,
    });

    return { txHash: hash };
  }

  async refundEscrow(
    taskId: string,
    reason: string,
  ): Promise<{ txHash: string }> {
    this.logger.log(`Refunding escrow for task ${taskId}, reason: ${reason}`);

    if (!this.walletClient) {
      throw new Error('Escrow wallet not configured');
    }

    const data = encodeFunctionData({
      abi: ESCROW_ABI,
      functionName: 'refundRemaining',
      args: [taskId as `0x${string}`],
    });

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
      data,
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
