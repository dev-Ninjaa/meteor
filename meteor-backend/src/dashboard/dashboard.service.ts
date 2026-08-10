import { Injectable, Logger } from '@nestjs/common';
import { Prisma, TaskStatus, VerificationMode, EscrowStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';

export interface DashboardTaskResponse {
  id: string;
  title: string;
  description: string;
  reward: string;
  tokenAddress: string | null;
  status: string;
  aiGenerated: boolean;
  tags: string[];
  workersRequired: number;
  workersJoined: number;
  workersCompleted: number;
  maxWorkers: number;
  verificationMode: string;
  allowAiVerification: boolean;
  manualVerificationRequired: boolean;
  escrowStatus: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  // Dashboard-specific fields
  myRole: 'creator' | 'worker' | 'joined';
  mySubmission?: {
    id: string;
    status: string;
    content: string;
    createdAt: Date;
    verification?: {
      status: string;
      score?: number;
    };
  };
}

export interface DashboardResponse {
  created: {
    data: DashboardTaskResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  submitted: {
    data: DashboardTaskResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  joined: {
    data: DashboardTaskResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, query: QueryDashboardDto): Promise<DashboardResponse> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [created, submitted, joined] = await Promise.all([
      this.getCreatedTasks(userId, query, skip, limit),
      this.getSubmittedTasks(userId, query, skip, limit),
      this.getJoinedTasks(userId, query, skip, limit),
    ]);

    return { created, submitted, joined };
  }

  async getCreatedTasks(userId: string, query: QueryDashboardDto, skip: number, limit: number) {
    const where: Prisma.TaskWhereInput = {
      createdById: userId,
      deletedAt: null,
    };

    if (query.status) {
      where.status = query.status as TaskStatus;
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          submissions: {
            where: { workerId: userId },
            take: 1,
            include: { verification: true },
          },
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map((task) => this.mapDashboardTask(task, 'creator', userId)),
      total,
      page: query.page || 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSubmittedTasks(userId: string, query: QueryDashboardDto, skip: number, limit: number) {
    const where: Prisma.SubmissionWhereInput = {
      workerId: userId,
    };

    if (query.status) {
      where.task = { status: query.status as TaskStatus };
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: true,
          verification: true,
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data: submissions.map((sub) => this.mapDashboardTask(sub.task, 'worker', userId, sub)),
      total,
      page: query.page || 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getJoinedTasks(userId: string, query: QueryDashboardDto, skip: number, limit: number) {
    const where: Prisma.TaskWorkerWhereInput = {
      userId,
      task: {
        deletedAt: null,
      },
    };

    if (query.status) {
      where.task = where.task || {};
      where.task.status = query.status as TaskStatus;
    }

    const [taskWorkers, total] = await Promise.all([
      this.prisma.taskWorker.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          task: {
            include: {
              submissions: {
                where: { workerId: userId },
                take: 1,
                include: { verification: true },
              },
            },
          },
        },
      }),
      this.prisma.taskWorker.count({ where }),
    ]);

    return {
      data: taskWorkers.map((tw) =>
        this.mapDashboardTask(tw.task, 'joined', userId, tw.task.submissions[0]),
      ),
      total,
      page: query.page || 1,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private mapDashboardTask(
    task: any,
    role: 'creator' | 'worker' | 'joined',
    userId: string,
    submission?: any,
  ): DashboardTaskResponse {
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
      allowAiVerification: task.allowAiVerification,
      manualVerificationRequired: task.manualVerificationRequired,
      escrowStatus: task.escrowStatus,
      createdById: task.createdById,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      myRole: role,
      mySubmission: submission
        ? {
            id: submission.id,
            status: submission.status,
            content: submission.content,
            createdAt: submission.createdAt,
            verification: submission.verification
              ? {
                  status: submission.verification.status,
                  score: submission.verification.score,
                }
              : undefined,
          }
        : undefined,
    };
  }
}
