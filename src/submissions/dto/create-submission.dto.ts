import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubmissionDto {
  @ApiProperty({ description: 'Submission content', example: 'Here is my completed work...' })
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  content!: string;

  @ApiPropertyOptional({
    description: 'Optional proof URL or reference',
    example: 'https://github.com/user/repo/pull/1',
  })
  @IsString()
  @IsOptional()
  proof?: string;
}
