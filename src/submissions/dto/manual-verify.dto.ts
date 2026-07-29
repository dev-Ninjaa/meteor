import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ManualVerifyDto {
  @ApiProperty({ description: 'Verification verdict', enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  @IsEnum(['APPROVED', 'REJECTED'] as const)
  status!: string;

  @ApiPropertyOptional({
    description: 'Notes from manual review',
    example: 'The submission meets all criteria',
  })
  @IsString()
  @IsOptional()
  manualNotes?: string;
}
