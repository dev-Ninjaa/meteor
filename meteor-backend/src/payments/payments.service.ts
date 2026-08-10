import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Prisma, EscrowStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BlockchainService, MONAD_CHAIN } from '../blockchain/blockchain.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-types';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { ClaimEscrowDto } from './dto/claim-escrow.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { ConfigService } from '@nestjs/config';

export interface TransactionResponse {
  id: string;
  amount: string;
  tokenAddress: string | null;
  txHash: string | null;
  chainId: number | null;
  blockNumber: string | null;
  gasUsed: string | null;
  status: string;
  type: string;
  taskId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitterService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Initialize blockchain event listeners
    await this.blockchainService.initializeEventListeners();
  }

  async createEscrow(userId: string, dto: CreateEscrowDto): Promise<TransactionResponse> {
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can create escrow');
    }

    if (task.status !== 'OPEN') {
      throw new ForbiddenException('Can only create escrow for open tasks');
    }

    if (task.escrowStatus !== 'UNLOCKED') {
      throw new ConflictException('Escrow already exists for this task');
    }

    const totalAmount =
      dto.amount || new Prisma.Decimal(task.reward).mul(task.workersRequired).toString();

    // Verify the transaction on-chain (creator's tx)
    const receipt = await this.verifyEscrowTransaction(dto.txHash, dto.taskId);
    if (!receipt.confirmed) {
      throw new ForbiddenException('Transaction not confirmed on-chain');
    }

    // Verify the transaction matches expected parameters
    const isValid = await this.validateEscrowTransaction(dto.txHash, dto.taskId, totalAmount);
    if (!isValid) {
      throw new ForbiddenException('Transaction does not match expected escrow parameters');
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount: new Prisma.Decimal(totalAmount),
          tokenAddress: task.tokenAddress,
          txHash: dto.txHash,
          status: 'LOCKED' as TransactionStatus,
          type: 'ESCROW_CREATE',
          taskId: dto.taskId,
          userId,
        },
      });

      await tx.task.update({
        where: { id: dto.taskId },
        data: { escrowStatus: 'LOCKED' as EscrowStatus },
      });

      this.logger.log(
        `Escrow created for task ${dto.taskId}: txHash=${dto.txHash}, amount=${totalAmount}`,
      );

      return txRecord;
    });

    await this.notificationsService.createNotification({
      receiverId: userId,
      type: NotificationType.ESCROW_LOCKED,
      title: 'Escrow Locked',
      message: `Escrow of ${totalAmount} has been locked for task "${task.title}".`,
      metadata: { taskId: dto.taskId, amount: totalAmount, txHash: dto.txHash },
    });

    this.eventEmitter.emit('escrow.locked', {
      taskId: dto.taskId,
      userId,
      amount: totalAmount,
      txHash: dto.txHash,
    });

    return this.mapTransactionResponse(transaction);
  }

  async releaseEscrow(userId: string, dto: ReleaseEscrowDto): Promise<TransactionResponse> {
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can release escrow');
    }

    if (task.escrowStatus !== 'LOCKED') {
      throw new ConflictException('Escrow is not in a locked state');
    }

    if (task.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot release escrow for a cancelled task');
    }

    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      include: { verification: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    if (submission.status !== 'APPROVED') {
      throw new ForbiddenException('Cannot release payment for a submission that is not approved');
    }

    if (!submission.verification || submission.verification.status !== 'PASSED') {
      throw new ForbiddenException('Cannot release payment without a passed verification');
    }

    // NOTE: This endpoint is DEPRECATED - contract uses pull-payment (workers call claimPayment)
    // The blockchainService.releaseFunds() tries to call non-existent 'releaseEscrow' function
    // Keeping for API compatibility but throwing clear error
    throw new ForbiddenException(
      'Manual escrow release not supported. Contract uses pull-payment: workers claim payments themselves via claimPayment(). Use POST /payments/escrow/claim instead.'
    );

    // const { txHash } = await this.blockchainService.releaseFunds(dto.taskId, dto.submissionId);
    // ... rest of function is dead code after throw
  }

  async refundEscrow(userId: string, dto: RefundEscrowDto): Promise<TransactionResponse> {
    const task = await this.prisma.task.findUnique({ where: { id: dto.taskId } });
    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can refund escrow');
    }

    if (task.escrowStatus !== 'LOCKED') {
      throw new ConflictException('Escrow is not in a locked state');
    }

    const canRefund = task.status === 'CANCELLED';

    if (!canRefund) {
      const submissions = await this.prisma.submission.findMany({
        where: { taskId: dto.taskId },
      });

      if (submissions.length === 0) {
        throw new ForbiddenException(
          'Cannot refund escrow: task is not cancelled and has no rejected submissions',
        );
      }

      const allRejected = submissions.every((s) => s.status === 'REJECTED');
      if (!allRejected) {
        throw new ForbiddenException('Cannot refund escrow: not all submissions are rejected');
      }
    }

    const { txHash } = await this.blockchainService.refundEscrow(
      dto.taskId,
      dto.reason || 'Escrow refunded',
    );

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount: task.reward,
          tokenAddress: task.tokenAddress,
          txHash,
          status: 'REFUNDED' as TransactionStatus,
          type: 'ESCROW_REFUND',
          taskId: dto.taskId,
          userId,
        },
      });

      await tx.task.update({
        where: { id: dto.taskId },
        data: { escrowStatus: 'REFUNDED' as EscrowStatus },
      });

      this.logger.log(`Escrow refunded for task ${dto.taskId}: txHash=${txHash}`);

      return txRecord;
    });

    await this.notificationsService.createNotification({
      receiverId: userId,
      type: NotificationType.ESCROW_REFUNDED,
      title: 'Escrow Refunded',
      message: `Escrow for task "${task.title}" has been refunded.`,
      metadata: { taskId: dto.taskId, txHash, reason: dto.reason },
    });

    this.eventEmitter.emit('escrow.refunded', {
      taskId: dto.taskId,
      userId,
      txHash,
      reason: dto.reason,
    });

    return this.mapTransactionResponse(transaction);
  }

  async claimEscrow(userId: string, dto: ClaimEscrowDto): Promise<TransactionResponse> {
    const submission = await this.prisma.submission.findFirst({
      where: { taskId: dto.taskId, workerId: userId },
      include: { verification: true, task: true },
    });

    if (!submission || submission.task.deletedAt) {
      throw new NotFoundException('Submission not found for this task');
    }

    if (submission.status !== 'APPROVED') {
      throw new ForbiddenException('Cannot claim payment for a submission that is not approved');
    }

    if (!submission.verification || submission.verification.status !== 'PASSED') {
      throw new ForbiddenException('Cannot claim payment without a passed verification');
    }

    if (submission.claimed) {
      throw new ConflictException('Payment has already been claimed for this submission');
    }

    // Check if transaction already recorded (idempotency - blockchain event listener may have recorded it first)
    const existingTx = await this.prisma.transaction.findFirst({
      where: { txHash: dto.txHash.toLowerCase(), type: 'CLAIM_PAYMENT' },
    });

    if (existingTx) {
      this.logger.log(`Claim payment already recorded for txHash: ${dto.txHash}`);
      // Ensure submission is marked as claimed
      if (!submission.claimed) {
        await this.prisma.submission.update({
          where: { id: submission.id },
          data: { claimed: true },
        });
      }
      return this.mapTransactionResponse(existingTx);
    }

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount: submission.task.reward,
          tokenAddress: submission.task.tokenAddress,
          txHash: dto.txHash,
          status: 'RELEASED' as TransactionStatus,
          type: 'CLAIM_PAYMENT',
          taskId: dto.taskId,
          userId,
        },
      });

      await tx.submission.update({
        where: { id: submission.id },
        data: { claimed: true },
      });

      this.logger.log(
        `Payment claimed for task ${dto.taskId}, submission ${submission.id}: txHash=${dto.txHash}`,
      );

      return txRecord;
    });

    this.eventEmitter.emit('payment.claimed', {
      taskId: dto.taskId,
      userId,
      submissionId: submission.id,
      txHash: dto.txHash,
    });

    return this.mapTransactionResponse(transaction);
  }

  async findTransactions(
    userId: string,
    query: QueryTransactionsDto,
  ): Promise<{
    data: TransactionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status as TransactionStatus;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.taskId) {
      where.taskId = query.taskId;
    }

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: data.map(this.mapTransactionResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findTransaction(id: string): Promise<TransactionResponse> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.mapTransactionResponse(transaction);
  }

  private async verifyEscrowTransaction(
    txHash: string,
    _taskId: string,
  ): Promise<{ confirmed: boolean; blockNumber: bigint | null }> {
    const { createPublicClient, http } = await import('viem');

    const rpcUrl = this.configService.get<string>('monad.rpcUrl', 'https://testnet-rpc.monad.xyz');
    const chainId = this.configService.get<number>('monad.chainId', 10143);
    const chain = { ...MONAD_CHAIN, id: chainId, rpcUrls: { default: { http: [rpcUrl] } } };

    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

    // Add retry logic with exponential backoff for pending transactions
    const maxRetries = 10;
    const baseDelay = 1000; // 1 second

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const receipt = await publicClient.getTransactionReceipt({
          hash: txHash as `0x${string}`,
        });

        if (receipt) {
          return {
            confirmed: receipt.status === 'success',
            blockNumber: receipt.blockNumber,
          };
        }
      } catch (error: any) {
        // Transaction not found yet, wait and retry
        if (
          error.name === 'TransactionReceiptNotFoundError' ||
          error.message?.includes('not been mined')
        ) {
          if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
            this.logger.log(
              `Transaction ${txHash} not mined yet, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }
        throw error;
      }
    }

    // If we get here, all retries exhausted
    throw new Error(`Transaction ${txHash} not mined after ${maxRetries} attempts`);
  }

  private async validateEscrowTransaction(
    txHash: string,
    taskId: string,
    expectedAmount: string,
  ): Promise<boolean> {
    const { createPublicClient, http, parseEther } = await import('viem');

    const rpcUrl = this.configService.get<string>('monad.rpcUrl', 'https://testnet-rpc.monad.xyz');
    const chainId = this.configService.get<number>('monad.chainId', 10143);
    const chain = { ...MONAD_CHAIN, id: chainId, rpcUrls: { default: { http: [rpcUrl] } } };

    const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });
    const escrowContractAddress = this.configService.get<string>('monad.escrowContractAddress', '');

    try {
      const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });

      // Verify recipient is escrow contract
      if (tx.to?.toLowerCase() !== escrowContractAddress.toLowerCase()) {
        return false;
      }

      // Verify value matches expected amount
      const expectedValue = parseEther(expectedAmount);
      if (tx.value !== expectedValue) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  private mapTransactionResponse(tx: {
    id: string;
    amount: Prisma.Decimal;
    tokenAddress: string | null;
    txHash: string | null;
    chainId: number | null;
    blockNumber: bigint | null;
    gasUsed: string | null;
    status: string;
    type: string;
    taskId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }): TransactionResponse {
    return {
      id: tx.id,
      amount: tx.amount.toString(),
      tokenAddress: tx.tokenAddress,
      txHash: tx.txHash,
      chainId: tx.chainId,
      blockNumber: tx.blockNumber?.toString() ?? null,
      gasUsed: tx.gasUsed,
      status: tx.status,
      type: tx.type,
      taskId: tx.taskId,
      userId: tx.userId,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };
  }
}
