import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTasksDto {
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

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
  })
  @IsString()
  @IsOptional()
  @IsEnum(['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'])
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by creator ID', example: 'uuid' })
  @IsString()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Filter by tag', example: 'frontend' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: 'Filter by escrow status', enum: ['UNLOCKED', 'LOCKED', 'RELEASED', 'REFUNDED'] })
  @IsString()
  @IsOptional()
  @IsEnum(['UNLOCKED', 'LOCKED', 'RELEASED', 'REFUNDED'])
  escrowStatus?: string;

  @ApiPropertyOptional({ description: 'Include unlocked (draft) tasks', default: false })
  @IsBoolean()
  @IsOptional()
  showUnlocked?: boolean;
}
