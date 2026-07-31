import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'alice', nullable: true })
  username!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  avatarUrl!: string | null;

  @ApiPropertyOptional({ example: 'Full-stack developer and bug hunter' })
  bio!: string | null;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', nullable: true })
  walletAddress!: string | null;

  @ApiProperty({ example: 0 })
  reputation!: number;

  @ApiProperty({ example: 'USER' })
  role!: string;

  @ApiProperty({ example: '2026-07-29T12:00:00.000Z' })
  createdAt!: Date;
}
