import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Submission content', example: 'Here is my completed work...' })
  @IsString()
  @MaxLength(50000)
  content!: string;

  @ApiPropertyOptional({
    description: 'Submission type used to answer this task',
    enum: ['text', 'multiple_choice', 'rating', 'file', 'checklist'],
    default: 'text',
  })
  @IsString()
  @IsOptional()
  submissionType?: string;

  @ApiPropertyOptional({
    description: 'Optional proof URL or reference',
    example: 'https://github.com/user/repo/pull/1',
  })
  @IsString()
  @IsOptional()
  proof?: string;
}
