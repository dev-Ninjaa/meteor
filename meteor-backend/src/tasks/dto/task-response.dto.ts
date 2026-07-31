import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Build a landing page' })
  title!: string;

  @ApiProperty({ example: 'Create a responsive landing page using React and Tailwind CSS' })
  description!: string;

  @ApiProperty({ example: '0.1' })
  reward!: string;

  @ApiPropertyOptional({ example: '0x0000000000000000000000000000000000000000' })
  tokenAddress!: string | null;

  @ApiProperty({
    example: 'OPEN',
    enum: ['DRAFT', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED'],
  })
  status!: string;

  @ApiProperty({ example: false })
  aiGenerated!: boolean;

  @ApiProperty({ example: ['frontend', 'react'] })
  tags!: string[];

  @ApiProperty({ example: 3 })
  workersRequired!: number;

  @ApiProperty({ example: 0 })
  workersJoined!: number;

  @ApiProperty({ example: 0 })
  workersCompleted!: number;

  @ApiProperty({ example: 10 })
  maxWorkers!: number;

  @ApiProperty({ example: 'AI' })
  verificationMode!: string;

  @ApiProperty({ example: true })
  allowAiVerification!: boolean;

  @ApiProperty({ example: false })
  manualVerificationRequired!: boolean;

  @ApiProperty()
  createdById!: string;

  @ApiProperty({ example: '2026-07-29T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-07-29T12:00:00.000Z' })
  updatedAt!: Date;
}
