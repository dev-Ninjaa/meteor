import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RefundEscrowDto {
  @ApiProperty({
    description: 'Task ID to refund escrow for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  taskId!: string;

  @ApiPropertyOptional({ description: 'Reason for refund', example: 'Task cancelled by creator' })
  @IsString()
  @IsOptional()
  reason?: string;
}
