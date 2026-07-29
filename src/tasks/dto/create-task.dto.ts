import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
  Min,
  ArrayMinSize,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title', example: 'Build a landing page' })
  @IsString()
  @Length(3, 200)
  title!: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Create a responsive landing page using React and Tailwind CSS',
  })
  @IsString()
  @Length(10, 5000)
  description!: string;

  @ApiProperty({ description: 'Reward amount per worker', example: '0.1' })
  @IsString()
  reward!: string;

  @ApiPropertyOptional({
    description: 'Token address for payment',
    example: '0x0000000000000000000000000000000000000000',
  })
  @IsString()
  @IsOptional()
  tokenAddress?: string;

  @ApiProperty({ description: 'Task tags', example: ['frontend', 'react', 'tailwind'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags!: string[];

  @ApiProperty({ description: 'Number of workers required', example: 3, minimum: 1 })
  @IsNumber()
  @Min(1)
  workersRequired!: number;

  @ApiProperty({ description: 'Maximum number of workers', example: 10, minimum: 1 })
  @IsNumber()
  @Min(1)
  maxWorkers!: number;

  @ApiPropertyOptional({
    description: 'Verification mode',
    enum: ['AI', 'MANUAL', 'BOTH'],
    default: 'AI',
  })
  @IsString()
  @IsOptional()
  @IsEnum(['AI', 'MANUAL', 'BOTH'])
  verificationMode?: string;

  @ApiPropertyOptional({ description: 'Allow AI verification', default: true })
  @IsBoolean()
  @IsOptional()
  allowAiVerification?: boolean;

  @ApiPropertyOptional({ description: 'Require manual verification', default: false })
  @IsBoolean()
  @IsOptional()
  manualVerificationRequired?: boolean;
}
