import { IsString, IsOptional, Length, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Display name', example: 'alice' })
  @IsString()
  @IsOptional()
  @Length(3, 30)
  username?: string;

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.png' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({ description: 'Short bio', example: 'Full-stack developer and bug hunter' })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  bio?: string;

  @ApiPropertyOptional({ description: 'Additional profile metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
