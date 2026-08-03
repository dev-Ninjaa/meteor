import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDashboardDto {
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

  @ApiPropertyOptional({ description: 'Tab to show: created | submitted | joined', example: 'created' })
  @IsString()
  @IsOptional()
  @IsEnum(['created', 'submitted', 'joined'])
  tab?: 'created' | 'submitted' | 'joined';

  @ApiPropertyOptional({ description: 'Filter by status', example: 'OPEN' })
  @IsString()
  @IsOptional()
  status?: string;
}