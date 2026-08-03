import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { QueryDashboardDto } from './dto/query-dashboard.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard - my created tasks, submitted tasks, and joined tasks' })
  @ApiResponse({ status: 200, description: 'Dashboard data' })
  async getDashboard(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryDashboardDto,
  ) {
    return this.dashboardService.getDashboard(userId, query);
  }

  @Get('created')
  @ApiOperation({ summary: 'Get tasks I created' })
  @ApiResponse({ status: 200, description: 'Created tasks' })
  async getCreated(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryDashboardDto,
  ) {
    return this.dashboardService.getCreatedTasks(userId, query, 0, query.limit || 20);
  }

  @Get('submitted')
  @ApiOperation({ summary: 'Get tasks I submitted work to' })
  @ApiResponse({ status: 200, description: 'Submitted tasks' })
  async getSubmitted(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryDashboardDto,
  ) {
    return this.dashboardService.getSubmittedTasks(userId, query, 0, query.limit || 20);
  }

  @Get('joined')
  @ApiOperation({ summary: 'Get tasks I joined' })
  @ApiResponse({ status: 200, description: 'Joined tasks' })
  async getJoined(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryDashboardDto,
  ) {
    return this.dashboardService.getJoinedTasks(userId, query, 0, query.limit || 20);
  }
}