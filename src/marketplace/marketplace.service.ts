import { Injectable, Logger } from '@nestjs/common';
import { Prisma, VerificationMode } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { QueryMarketplaceDto } from './dto/query-marketplace.dto';

export interface MarketplaceTaskResponse {
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
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryMarketplaceDto): Promise<{
    data: MarketplaceTaskResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.TaskWhereInput = {
      status: 'OPEN',
      deletedAt: null,
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tag) {
      where.tags = { has: query.tag };
    }

    if (query.verificationMode) {
      where.verificationMode = query.verificationMode as VerificationMode;
    }

    if (query.minReward || query.maxReward) {
      where.reward = {};
      if (query.minReward) {
        (where.reward as Prisma.DecimalFilter).gte = new Prisma.Decimal(query.minReward);
      }
      if (query.maxReward) {
        (where.reward as Prisma.DecimalFilter).lte = new Prisma.Decimal(query.maxReward);
      }
    }

    if (query.createdBy) {
      where.createdById = query.createdBy;
    }

    let orderBy: Prisma.TaskOrderByWithRelationInput = { createdAt: 'desc' };

    if (query.sortBy === 'highest_reward') {
      orderBy = { reward: 'desc' };
    } else if (query.sortBy === 'most_workers') {
      orderBy = { workersJoined: 'desc' };
    }

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data: data.map(this.mapTaskResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async search(query: QueryMarketplaceDto & { search: string }): Promise<{
    data: MarketplaceTaskResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.findAll(query);
  }

  async getTags(): Promise<string[]> {
    const tasks = await this.prisma.task.findMany({
      where: {
        status: 'OPEN',
        deletedAt: null,
      },
      select: {
        tags: true,
      },
    });

    const tagSet = new Set<string>();
    for (const task of tasks) {
      for (const tag of task.tags) {
        tagSet.add(tag);
      }
    }

    return Array.from(tagSet).sort();
  }

  private mapTaskResponse(task: {
    id: string;
    title: string;
    description: string;
    reward: Prisma.Decimal;
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
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
  }): MarketplaceTaskResponse {
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
      createdById: task.createdById,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
