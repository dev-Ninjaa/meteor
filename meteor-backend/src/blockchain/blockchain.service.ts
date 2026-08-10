import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { encodeFunctionData } from 'viem/utils';
import { privateKeyToAccount } from 'viem/accounts';
import { PrismaService } from '../database/prisma.service';
import { Prisma, TransactionStatus } from '@prisma/client';

export const ESCROW_ABI = [
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
  // Events
  {
    type: 'event',
    name: 'ClaimPayment',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'worker', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EscrowLocked',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'rewardPerWorker', type: 'uint256', indexed: false, internalType: 'uint256' },
      { name: 'maxWorkers', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EscrowReleased',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'submissionId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'worker', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EscrowRefunded',
    inputs: [
      { name: 'taskId', type: 'bytes32', indexed: true, internalType: 'bytes32' },
      { name: 'creator', type: 'address', indexed: true, internalType: 'address' },
      { name: 'amount', type: 'uint256', indexed: false, internalType: 'uint256' },
    ],
    anonymous: false,
  },
] as const;

export const MONAD_CHAIN = {
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

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
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

  // Event listener for on-chain events
  private eventListenersInitialized = false;

  async initializeEventListeners(): Promise<void> {
    if (this.eventListenersInitialized) return;
    this.eventListenersInitialized = true;

    try {
      // Listen for ClaimPayment events
      this.publicClient.watchContractEvent({
        address: this.escrowContractAddress as `0x${string}`,
        abi: ESCROW_ABI,
        eventName: 'ClaimPayment',
        onLogs: async (logs: any[]) => {
          for (const log of logs) {
            await this.handleClaimPaymentEvent(log);
          }
        },
        onError: (error: any) => {
          this.logger.error('ClaimPayment event listener error:', error);
        },
      });

      // Listen for EscrowLocked events
      this.publicClient.watchContractEvent({
        address: this.escrowContractAddress as `0x${string}`,
        abi: ESCROW_ABI,
        eventName: 'EscrowLocked',
        onLogs: async (logs: any[]) => {
          for (const log of logs) {
            await this.handleEscrowLockedEvent(log);
          }
        },
        onError: (error: any) => {
          this.logger.error('EscrowLocked event listener error:', error);
        },
      });

      // Listen for EscrowRefunded events
      this.publicClient.watchContractEvent({
        address: this.escrowContractAddress as `0x${string}`,
        abi: ESCROW_ABI,
        eventName: 'EscrowRefunded',
        onLogs: async (logs: any[]) => {
          for (const log of logs) {
            await this.handleEscrowRefundedEvent(log);
          }
        },
        onError: (error: any) => {
          this.logger.error('EscrowRefunded event listener error:', error);
        },
      });

      this.logger.log('Blockchain event listeners initialized');
    } catch (error) {
      this.logger.error('Failed to initialize event listeners:', error);
    }
  }

  private async handleClaimPaymentEvent(log: any): Promise<void> {
    try {
      const { taskId, worker, amount } = log.args;
      this.logger.log(`ClaimPayment event: taskId=${taskId}, worker=${worker}, amount=${amount}`);

      // Record the transaction in the database
      await this.recordClaimPaymentTransaction(taskId, worker, amount, log.transactionHash);
    } catch (error) {
      this.logger.error('Failed to handle ClaimPayment event:', error);
    }
  }

  private async handleEscrowLockedEvent(log: any): Promise<void> {
    try {
      const { taskId, creator, amount, rewardPerWorker, maxWorkers } = log.args;
      this.logger.log(`EscrowLocked event: taskId=${taskId}, creator=${creator}, amount=${amount}`);

      // The backend already records this when creator calls createEscrow
      // But we can verify it matches
    } catch (error) {
      this.logger.error('Failed to handle EscrowLocked event:', error);
    }
  }

  private async handleEscrowRefundedEvent(log: any): Promise<void> {
    try {
      const { taskId, creator, amount } = log.args;
      this.logger.log(
        `EscrowRefunded event: taskId=${taskId}, creator=${creator}, amount=${amount}`,
      );

      // The backend already records this when creator calls refundEscrow
    } catch (error) {
      this.logger.error('Failed to handle EscrowRefunded event:', error);
    }
  }

  private async recordClaimPaymentTransaction(
    taskId: string,
    worker: string,
    amount: bigint,
    txHash: string,
  ): Promise<void> {
    try {
      // Find the submission for this task and worker
      const submission = await this.prisma.submission.findFirst({
        where: {
          taskId,
          workerId: worker,
        },
      });

      if (!submission) {
        this.logger.warn(`No submission found for task ${taskId} and worker ${worker}`);
        return;
      }

      // Check if transaction already recorded
      const existingTx = await this.prisma.transaction.findFirst({
        where: {
          txHash: txHash.toLowerCase(),
          type: 'CLAIM_PAYMENT',
        },
      });

      if (existingTx) {
        this.logger.log(`Claim payment transaction already recorded: ${txHash}`);
        return;
      }

      const amountStr = amount.toString();

      await this.prisma.transaction.create({
        data: {
          amount: new Prisma.Decimal(amountStr),
          tokenAddress: null,
          txHash: txHash.toLowerCase(),
          status: 'RELEASED' as TransactionStatus,
          type: 'CLAIM_PAYMENT',
          taskId,
          userId: worker,
        },
      });

      this.logger.log(
        `Recorded claim payment: taskId=${taskId}, worker=${worker}, amount=${amountStr}, txHash=${txHash}`,
      );
    } catch (error) {
      this.logger.error('Failed to record claim payment transaction:', error);
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
      args: [taskIdBytes32, rewardPerWorkerWei, maxWorkersBigInt],
    });

    const hash = await this.walletClient.sendTransaction({
      to: this.escrowContractAddress as `0x${string}`,
      value: parseEther(amount),
      data,
    });

    return { txHash: hash };
  }

  async releaseFunds(taskId: string, submissionId: string): Promise<{ txHash: string }> {
    // DEPRECATED: Contract uses pull-payment only (workers call claimPayment)
    // There is NO 'releaseEscrow' function in BountyEscrow contract
    this.logger.warn('releaseFunds() called but contract has no releaseEscrow function - pull payment only');
    throw new Error('Manual escrow release not supported. Contract uses pull-payment: workers call claimPayment() themselves.');

    // if (!this.walletClient) {
    //   throw new Error('Escrow wallet not configured');
    // }

    // const data = encodeFunctionData({
    //   abi: ESCROW_ABI,
    //   functionName: 'releaseEscrow',
    //   args: [taskId as `0x${string}`, submissionId as `0x${string}`],
    // });

    // const hash = await this.walletClient.sendTransaction({
    //   to: this.escrowContractAddress as `0x${string}`,
    //   data,
    // });

    // return { txHash: hash };
  }

  async refundEscrow(taskId: string, reason: string): Promise<{ txHash: string }> {
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
