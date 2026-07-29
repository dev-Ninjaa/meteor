import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  Min,
  ArrayMinSize,
  Length,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTaskDto {
  @ApiPropertyOptional({ description: 'Task title', example: 'Build a landing page' })
  @IsString()
  @IsOptional()
  @Length(3, 200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Create a responsive landing page...',
  })
  @IsString()
  @IsOptional()
  @Length(10, 5000)
  description?: string;

  @ApiPropertyOptional({ description: 'Reward amount per worker', example: '0.1' })
  @IsString()
  @IsOptional()
  reward?: string;

  @ApiPropertyOptional({ description: 'Token address for payment' })
  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @ApiPropertyOptional({ description: 'Task tags', example: ['frontend', 'react'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @ArrayMinSize(1)
  tags?: string[];

  @ApiPropertyOptional({ description: 'Number of workers required', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  workersRequired?: number;

  @ApiPropertyOptional({ description: 'Maximum number of workers', minimum: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  maxWorkers?: number;

  @ApiPropertyOptional({ description: 'Verification mode', enum: ['AI', 'MANUAL', 'BOTH'] })
  @IsString()
  @IsOptional()
  @IsEnum(['AI', 'MANUAL', 'BOTH'])
  verificationMode?: string;

  @ApiPropertyOptional({ description: 'Allow AI verification' })
  @IsBoolean()
  @IsOptional()
  allowAiVerification?: boolean;

  @ApiPropertyOptional({ description: 'Require manual verification' })
  @IsBoolean()
  @IsOptional()
  manualVerificationRequired?: boolean;
}
