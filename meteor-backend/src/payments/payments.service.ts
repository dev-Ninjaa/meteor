import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, EscrowStatus, TransactionStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-types';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

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
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly blockchainService: BlockchainService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

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

    const creator = await this.prisma.user.findUnique({ where: { id: userId } });
    const workerAddress = creator?.walletAddress || '';

    const { txHash } = await this.blockchainService.createEscrow(
      dto.taskId,
      workerAddress,
      totalAmount,
    );

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount: new Prisma.Decimal(totalAmount),
          tokenAddress: task.tokenAddress,
          txHash,
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
        `Escrow created for task ${dto.taskId}: txHash=${txHash}, amount=${totalAmount}`,
      );

      return txRecord;
    });

    await this.notificationsService.createNotification({
      receiverId: userId,
      type: NotificationType.ESCROW_LOCKED,
      title: 'Escrow Locked',
      message: `Escrow of ${totalAmount} has been locked for task "${task.title}".`,
      metadata: { taskId: dto.taskId, amount: totalAmount, txHash },
    });

    this.eventEmitter.emit('escrow.locked', {
      taskId: dto.taskId,
      userId,
      amount: totalAmount,
      txHash,
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

    const { txHash } = await this.blockchainService.releaseFunds(dto.taskId, dto.submissionId);

    const transaction = await this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.transaction.create({
        data: {
          amount: task.reward,
          tokenAddress: task.tokenAddress,
          txHash,
          status: 'RELEASED' as TransactionStatus,
          type: 'ESCROW_RELEASE',
          taskId: dto.taskId,
          userId: submission.workerId,
        },
      });

      await tx.task.update({
        where: { id: dto.taskId },
        data: { escrowStatus: 'RELEASED' as EscrowStatus },
      });

      this.logger.log(
        `Escrow released for task ${dto.taskId}, submission ${dto.submissionId}: txHash=${txHash}`,
      );

      return txRecord;
    });

    await this.notificationsService.createNotification({
      senderId: task.createdById,
      receiverId: submission.workerId,
      type: NotificationType.ESCROW_RELEASED,
      title: 'Escrow Released',
      message: `Payment has been released for your submission on task "${task.title}".`,
      metadata: { taskId: dto.taskId, submissionId: dto.submissionId, txHash },
    });

    this.eventEmitter.emit('escrow.released', {
      taskId: dto.taskId,
      userId: submission.workerId,
      submissionId: dto.submissionId,
      txHash,
    });

    return this.mapTransactionResponse(transaction);
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

  async findTransactions(query: QueryTransactionsDto): Promise<{
    data: TransactionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {};

    if (query.status) {
      where.status = query.status as TransactionStatus;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.taskId) {
      where.taskId = query.taskId;
    }

    if (query.userId) {
      where.userId = query.userId;
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
