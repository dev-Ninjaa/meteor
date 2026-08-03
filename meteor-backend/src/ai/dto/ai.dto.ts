import { IsString, IsOptional, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTaskDto {
  @ApiProperty({
    description: 'Natural language prompt for task creation',
    example: 'I need 5 people to test my website and report bugs',
  })
  @IsString()
  @Length(10, 5000)
  prompt!: string;

  @ApiPropertyOptional({ description: 'Task category', example: 'testing' })
  @IsString()
  @IsOptional()
  category?: string;
}

export class VerifyTaskDto {
  @ApiProperty({ description: 'Task title', example: 'Test Website Review' })
  @IsString()
  taskTitle!: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Review our landing page and find bugs',
  })
  @IsString()
  taskDescription!: string;

  @ApiProperty({ description: 'Task requirements', example: 'Find at least 3 bugs' })
  @IsString()
  taskRequirements!: string;

  @ApiProperty({
    description: 'Worker submission content',
    example: 'Found 5 bugs: 1) Button alignment, 2) Mobile menu broken...',
  })
  @IsString()
  submissionContent!: string;

  @ApiPropertyOptional({
    description: 'Proof URL',
    example: 'https://screenshots.example.com/bugs',
  })
  @IsString()
  @IsOptional()
  submissionProof?: string;
}

export interface AiVerificationResult {
  passed: boolean;
  score: number;
  feedback: string;
}

export interface AiTaskSuggestion {
  title: string;
  description: string;
  reward: string;
  tags: string[];
  workersRequired: number;
  maxWorkers: number;
  verificationMode: 'AI' | 'MANUAL' | 'BOTH';
  category: string;
}
