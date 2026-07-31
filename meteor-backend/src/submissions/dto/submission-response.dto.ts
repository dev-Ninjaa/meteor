import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificationInfo {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'PASSED', 'FAILED'] })
  status!: string;

  @ApiPropertyOptional({ example: 0.95 })
  aiScore?: number | null;

  @ApiPropertyOptional({ example: 'Work meets all requirements' })
  aiFeedback?: string | null;

  @ApiPropertyOptional({ example: 'Looks good' })
  manualNotes?: string | null;

  @ApiProperty({ example: false })
  isManual!: boolean;

  @ApiPropertyOptional()
  verifiedById?: string | null;
}

export class SubmissionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Here is my completed work...' })
  content!: string;

  @ApiPropertyOptional({ example: 'https://github.com/user/repo/pull/1' })
  proof?: string | null;

  @ApiProperty({ example: 'PENDING', enum: ['PENDING', 'APPROVED', 'REJECTED'] })
  status!: string;

  @ApiPropertyOptional()
  aiScore?: number | null;

  @ApiPropertyOptional()
  aiFeedback?: string | null;

  @ApiProperty()
  taskId!: string;

  @ApiProperty()
  workerId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiPropertyOptional({ type: VerificationInfo })
  verification?: VerificationInfo | null;
}
