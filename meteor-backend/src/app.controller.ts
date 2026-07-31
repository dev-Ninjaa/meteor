import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './database/prisma.service';
import { RedisService } from './redis/redis.service';

@ApiTags('Health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Full health check (DB + Redis)' })
  @ApiResponse({ status: 200, description: 'Application is healthy' })
  @ApiResponse({ status: 503, description: 'Application is unhealthy' })
  async checkHealth(): Promise<Record<string, unknown>> {
    const healthStatus: Record<string, string> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime().toString(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      healthStatus.database = 'connected';
    } catch {
      healthStatus.database = 'disconnected';
      healthStatus.status = 'degraded';
    }

    try {
      await this.redis.getClient().ping();
      healthStatus.redis = 'connected';
    } catch {
      healthStatus.redis = 'disconnected';
      healthStatus.status = 'degraded';
    }

    this.logger.log(`Health check: ${JSON.stringify(healthStatus)}`);

    return healthStatus;
  }

  @Get('health/live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe (Kubernetes)' })
  @ApiResponse({ status: 200, description: 'Application is alive' })
  checkLiveness(): Record<string, string> {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }

  @Get('health/ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe (Kubernetes)' })
  @ApiResponse({ status: 200, description: 'Application is ready' })
  @ApiResponse({ status: 503, description: 'Application is not ready' })
  async checkReadiness(): Promise<Record<string, unknown>> {
    const readyStatus: Record<string, string> = {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      readyStatus.database = 'connected';
    } catch {
      readyStatus.database = 'disconnected';
      readyStatus.status = 'not ready';
    }

    try {
      await this.redis.getClient().ping();
      readyStatus.redis = 'connected';
    } catch {
      readyStatus.redis = 'disconnected';
      readyStatus.status = 'not ready';
    }

    return readyStatus;
  }
}
