import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ManualVerifyDto } from './dto/manual-verify.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Submissions')
@Controller()
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('tasks/:taskId/submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Submit work for a task' })
  @ApiResponse({ status: 201, description: 'Submission created', type: SubmissionResponseDto })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 409, description: 'Already submitted' })
  async create(
    @CurrentUser('sub') userId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.create(taskId, userId, dto);
  }

  @Get('tasks/:taskId/submissions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all submissions for a task' })
  @ApiResponse({ status: 200, description: 'List of submissions', type: [SubmissionResponseDto] })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async findByTask(
    @CurrentUser('sub') userId: string,
    @Param('taskId') taskId: string,
  ): Promise<SubmissionResponseDto[]> {
    return this.submissionsService.findByTask(taskId, userId);
  }

  @Get('submissions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single submission by ID' })
  @ApiResponse({ status: 200, description: 'Submission found', type: SubmissionResponseDto })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async findOne(@Param('id') id: string): Promise<SubmissionResponseDto> {
    return this.submissionsService.findOne(id);
  }

  @Post('submissions/:id/verify/ai')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a submission using AI' })
  @ApiResponse({
    status: 200,
    description: 'AI verification completed',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 409, description: 'Already verified' })
  async verifyAi(@Param('id') id: string): Promise<SubmissionResponseDto> {
    return this.submissionsService.verifyAi(id);
  }

  @Post('submissions/:id/verify/manual')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually verify a submission (creator or admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Manual verification completed',
    type: SubmissionResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  async verifyManual(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: ManualVerifyDto,
  ): Promise<SubmissionResponseDto> {
    return this.submissionsService.verifyManual(id, userId, dto);
  }
}
