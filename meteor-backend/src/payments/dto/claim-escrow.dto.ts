import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ClaimEscrowDto {
  @ApiProperty({
    description: 'Task ID the worker completed',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  taskId!: string;

  @ApiProperty({
    description: 'Transaction hash from worker calling claimPayment on contract',
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  })
  @IsString()
  txHash!: string;
}
