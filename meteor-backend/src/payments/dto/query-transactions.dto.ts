import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryTransactionsDto {
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

  @ApiPropertyOptional({ description: 'Filter by status', example: 'LOCKED' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by type', example: 'ESCROW_CREATE' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({ description: 'Filter by task ID', example: 'uuid' })
  @IsString()
  @IsOptional()
  taskId?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID', example: 'uuid' })
  @IsString()
  @IsOptional()
  userId?: string;
}
