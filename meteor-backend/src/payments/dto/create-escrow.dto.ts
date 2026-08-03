import { IsString, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEscrowDto {
  @ApiProperty({
    description: 'Task ID to create escrow for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  taskId!: string;

  @ApiProperty({
    description: 'Transaction hash from creator signing lockEscrow on contract',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  txHash!: string;

  @ApiPropertyOptional({
    description: 'Escrow amount (defaults to reward * workersRequired)',
    example: '0.5',
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d+(\.\d+)?$/, { message: 'amount must be a valid decimal string' })
  amount?: string;
}
