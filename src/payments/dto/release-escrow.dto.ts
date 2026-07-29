import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReleaseEscrowDto {
  @ApiProperty({
    description: 'Task ID to release escrow for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  taskId!: string;

  @ApiProperty({
    description: 'Submission ID to release payment for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  submissionId!: string;
}
