import { IsString, IsOptional, IsNumber, Min, IsEnum, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryMarketplaceDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 20, default: 20 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Search query (title/description)', example: 'landing page' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tag', example: 'frontend' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filter by verification mode',
    enum: ['AI', 'MANUAL', 'BOTH'],
  })
  @IsString()
  @IsOptional()
  verificationMode?: string;

  @ApiPropertyOptional({ description: 'Minimum reward', example: '0.01' })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, { message: 'minReward must be a valid decimal string' })
  minReward?: string;

  @ApiPropertyOptional({ description: 'Maximum reward', example: '10.0' })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, { message: 'maxReward must be a valid decimal string' })
  maxReward?: string;

  @ApiPropertyOptional({ description: 'Filter by creator ID', example: 'uuid' })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['newest', 'highest_reward', 'most_workers'],
    default: 'newest',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['newest', 'highest_reward', 'most_workers'])
  sortBy?: string;
}
