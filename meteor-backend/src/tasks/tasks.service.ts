import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, TaskStatus, VerificationMode, EscrowStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-types';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitterService,
    private readonly configService: ConfigService,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskResponseDto> {
    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        reward: new Prisma.Decimal(dto.reward),
        tokenAddress: dto.tokenAddress,
        tags: dto.tags,
        workersRequired: dto.workersRequired,
        maxWorkers: dto.maxWorkers,
        verificationMode: (dto.verificationMode as VerificationMode) || 'AI',
        submissionType: dto.submissionType || 'text',
        submissionOptions: dto.submissionOptions || [],
        allowAiVerification: dto.allowAiVerification ?? true,
        manualVerificationRequired: dto.manualVerificationRequired ?? false,
        createdById: userId,
        status: 'DRAFT',
      },
    });

    this.logger.log(`Task created: ${task.id} by user ${userId}`);

    this.eventEmitter.emit('task.created', {
      taskId: task.id,
      title: task.title,
      description: task.description,
      reward: task.reward.toString(),
      status: task.status,
      createdById: task.createdById,
      tags: task.tags,
    });

    return this.mapTaskResponse(task);
  }

  async findAll(query: QueryTasksDto): Promise<{
    data: TaskResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      deletedAt: null,
      // No default escrowStatus filter - show all tasks
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status as TaskStatus;
    }

    if (query.createdBy) {
      where.createdById = query.createdBy;
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    // Add escrowStatus filter only if explicitly provided
    if (query.escrowStatus) {
      where.escrowStatus = query.escrowStatus as any;
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map((task) => this.mapTaskResponse(task)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    if (!userId) {
      return this.mapTaskResponse(task);
    }

    const submission = await this.prisma.submission.findFirst({
      where: { taskId: id, workerId: userId },
      include: { verification: true },
    });

    return this.mapTaskResponse(task, submission ?? null);
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskResponseDto> {
    const task = await this.findTaskOrThrow(id);

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can update this task');
    }

    const updateData: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.reward !== undefined) updateData.reward = new Prisma.Decimal(dto.reward);
    if (dto.tokenAddress !== undefined) updateData.tokenAddress = dto.tokenAddress;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.workersRequired !== undefined) updateData.workersRequired = dto.workersRequired;
    if (dto.maxWorkers !== undefined) updateData.maxWorkers = dto.maxWorkers;
    if (dto.verificationMode !== undefined)
      updateData.verificationMode = dto.verificationMode as VerificationMode;
    if (dto.allowAiVerification !== undefined)
      updateData.allowAiVerification = dto.allowAiVerification;
    if (dto.manualVerificationRequired !== undefined)
      updateData.manualVerificationRequired = dto.manualVerificationRequired;

    const updated = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(`Task updated: ${id}`);

    this.eventEmitter.emit('task.updated', {
      taskId: updated.id,
      title: updated.title,
      status: updated.status,
      createdById: updated.createdById,
    });

    return this.mapTaskResponse(updated);
  }

  async remove(userId: string, id: string): Promise<void> {
    const task = await this.findTaskOrThrow(id);

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can delete this task');
    }

    await this.prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    this.logger.log(`Task soft-deleted: ${id}`);
  }

  async publish(
    userId: string,
    id: string,
  ): Promise<
    TaskResponseDto & {
      escrowData: {
        taskId: string;
        rewardPerWorker: string;
        maxWorkers: number;
        totalAmount: string;
        escrowContractAddress: string;
      };
    }
  > {
    const task = await this.findTaskOrThrow(id);

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can publish this task');
    }

    if (task.status !== 'DRAFT') {
      throw new ForbiddenException('Only draft tasks can be published');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: 'OPEN' },
    });

    await this.notificationsService.createNotification({
      receiverId: userId,
      type: NotificationType.TASK_PUBLISHED,
      title: 'Task Published',
      message: `Your task "${updated.title}" has been published.`,
      metadata: { taskId: updated.id },
    });

    this.logger.log(`Task published: ${id}`);
    this.eventEmitter.emit('task.published', {
      taskId: updated.id,
      title: updated.title,
      createdById: updated.createdById,
      status: updated.status,
    });

    // Return escrow data for frontend to prompt creator to lock escrow
    const totalAmount = new Prisma.Decimal(task.reward).mul(task.workersRequired).toString();
    const escrowContractAddress = this.configService.get<string>('monad.escrowContractAddress', '');

    return {
      ...this.mapTaskResponse(updated),
      escrowData: {
        taskId: updated.id,
        rewardPerWorker: task.reward.toString(),
        maxWorkers: task.maxWorkers,
        totalAmount,
        escrowContractAddress,
      },
    };
  }

  async cancel(userId: string, id: string): Promise<TaskResponseDto> {
    const task = await this.findTaskOrThrow(id);

    if (task.createdById !== userId) {
      throw new ForbiddenException('Only the task creator can cancel this task');
    }

    if (task.status === 'COMPLETED' || task.status === 'CANCELLED') {
      throw new ForbiddenException('Cannot cancel a completed or already cancelled task');
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.notificationsService.createNotification({
      receiverId: userId,
      type: NotificationType.TASK_CANCELLED,
      title: 'Task Cancelled',
      message: `Your task "${updated.title}" has been cancelled.`,
      metadata: { taskId: updated.id },
    });

    this.logger.log(`Task cancelled: ${id}`);

    this.eventEmitter.emit('task.cancelled', {
      taskId: updated.id,
      title: updated.title,
      createdById: updated.createdById,
      status: updated.status,
    });

    return this.mapTaskResponse(updated);
  }

  async join(userId: string, taskId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });

      if (!task || task.deletedAt) {
        throw new NotFoundException('Task not found');
      }

      if (task.status !== 'OPEN') {
        throw new ForbiddenException('Task is not open for joining');
      }

      if (task.createdById === userId) {
        throw new ForbiddenException('Cannot join your own task');
      }

      const existing = await tx.taskWorker.findUnique({
        where: { taskId_userId: { taskId, userId } },
      });

      if (existing) {
        throw new ConflictException('Already joined this task');
      }

      if (task.workersJoined >= task.maxWorkers) {
        throw new ForbiddenException('Task has reached maximum workers');
      }

      await tx.taskWorker.create({
        data: { taskId, userId },
      });

      await tx.task.update({
        where: { id: taskId },
        data: { workersJoined: { increment: 1 } },
      });
    });

    const joinedTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, title: true, createdById: true },
    });

    if (joinedTask) {
      await this.notificationsService.createNotification({
        senderId: userId,
        receiverId: joinedTask.createdById,
        type: NotificationType.TASK_JOINED,
        title: 'Worker Joined',
        message: `A new worker has joined your task "${joinedTask.title}".`,
        metadata: { taskId, workerId: userId },
      });
    }

    this.eventEmitter.emit('task.joined', {
      taskId,
      userId,
      workerId: userId,
    });

    this.logger.log(`User ${userId} joined task ${taskId}`);
  }

  async leave(userId: string, taskId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });

      if (!task || task.deletedAt) {
        throw new NotFoundException('Task not found');
      }

      const worker = await tx.taskWorker.findUnique({
        where: { taskId_userId: { taskId, userId } },
      });

      if (!worker) {
        throw new NotFoundException('Not a worker on this task');
      }

      const submission = await tx.submission.findFirst({
        where: { taskId, workerId: userId },
      });

      if (submission) {
        throw new ForbiddenException('Cannot leave task after submitting work');
      }

      await tx.taskWorker.delete({
        where: { id: worker.id },
      });

      await tx.task.update({
        where: { id: taskId },
        data: { workersJoined: { decrement: 1 } },
      });
    });

    this.eventEmitter.emit('task.left', {
      taskId,
      userId,
      workerId: userId,
    });

    this.logger.log(`User ${userId} left task ${taskId}`);
  }

  private async findTaskOrThrow(id: string): Promise<{
    id: string;
    title: string;
    description: string;
    reward: Prisma.Decimal;
    tokenAddress: string | null;
    status: TaskStatus;
    aiGenerated: boolean;
    aiPrompt: string | null;
    tags: string[];
    workersRequired: number;
    workersJoined: number;
    workersCompleted: number;
    maxWorkers: number;
    verificationMode: VerificationMode;
    submissionType: string;
    submissionOptions: string[];
    allowAiVerification: boolean;
    manualVerificationRequired: boolean;
    escrowStatus: EscrowStatus;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }> {
    const task = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  private mapTaskResponse(
    task: {
      id: string;
      title: string;
      description: string;
      reward: Prisma.Decimal;
      tokenAddress: string | null;
      status: TaskStatus;
      aiGenerated: boolean;
      aiPrompt: string | null;
      tags: string[];
      workersRequired: number;
      workersJoined: number;
      workersCompleted: number;
      maxWorkers: number;
      verificationMode: VerificationMode;
      submissionType: string;
      submissionOptions: string[];
      allowAiVerification: boolean;
      manualVerificationRequired: boolean;
      escrowStatus: EscrowStatus;
      createdById: string;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    },
    submission?: {
      id: string;
      content: string;
      proof: string | null;
      submissionType: string | null;
      status: string;
      claimed: boolean;
      workerId: string;
      aiScore: number | null;
      aiFeedback: string | null;
      createdAt: Date;
      updatedAt: Date;
      verification: {
        id: string;
        status: string;
        aiScore: number | null;
        aiFeedback: string | null;
        manualNotes: string | null;
        isManual: boolean;
        verifiedById: string | null;
      } | null;
    } | null,
  ): TaskResponseDto {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      reward: task.reward.toString(),
      tokenAddress: task.tokenAddress,
      status: task.status,
      aiGenerated: task.aiGenerated,
      tags: task.tags,
      workersRequired: task.workersRequired,
      workersJoined: task.workersJoined,
      workersCompleted: task.workersCompleted,
      maxWorkers: task.maxWorkers,
      verificationMode: task.verificationMode,
      submissionType: task.submissionType,
      submissionOptions: task.submissionOptions,
      allowAiVerification: task.allowAiVerification,
      manualVerificationRequired: task.manualVerificationRequired,
      escrowStatus: task.escrowStatus,
      createdById: task.createdById,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      mySubmission: submission
        ? {
            id: submission.id,
            content: submission.content,
            proof: submission.proof,
            submissionType: submission.submissionType,
            status: submission.status,
            claimed: submission.claimed,
            aiScore: submission.aiScore,
            aiFeedback: submission.aiFeedback,
            taskId: task.id,
            workerId: submission.workerId,
            createdAt: submission.createdAt,
            updatedAt: submission.updatedAt,
            verification: submission.verification
              ? {
                  id: submission.verification.id,
                  status: submission.verification.status,
                  aiScore: submission.verification.aiScore,
                  aiFeedback: submission.verification.aiFeedback,
                  manualNotes: submission.verification.manualNotes,
                  isManual: submission.verification.isManual,
                  verifiedById: submission.verification.verifiedById,
                }
              : null,
          }
        : null,
    };
  }
}
