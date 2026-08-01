import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, AiTaskSuggestion } from './ai.service';
import { GenerateTaskDto, VerifyTaskDto } from './dto/ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate task structure from natural language prompt' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI-generated task suggestion',
    schema: {
      example: {
        title: 'Test Website for Bugs',
        description: 'Review landing page and report 3+ bugs with screenshots',
        reward: '25.0',
        tags: ['testing', 'web', 'qa'],
        workersRequired: 3,
        maxWorkers: 5,
        verificationMode: 'AI',
        category: 'testing',
      }
    }
  })
  async generateTask(@Body() dto: GenerateTaskDto): Promise<AiTaskSuggestion> {
    return this.aiService.generateTask(dto);
  }

  @Post('verify-task')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify a submission using AI' })
  @ApiResponse({ 
    status: 200, 
    description: 'AI verification result',
    schema: {
      example: {
        passed: true,
        score: 0.95,
        feedback: 'Submission meets all requirements. Found 4 bugs with clear reproduction steps.',
      }
    }
  })
  async verifyTask(@Body() dto: VerifyTaskDto): Promise<{ passed: boolean; score: number; feedback: string }> {
    const result = await this.aiService.verifySubmission({
      taskTitle: dto.taskTitle,
      taskDescription: dto.taskDescription,
      taskRequirements: dto.taskRequirements,
      submissionContent: dto.submissionContent,
      submissionProof: dto.submissionProof,
    });
    return result;
  }
}