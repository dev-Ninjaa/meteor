import { ApiProperty } from '@nestjs/swagger';

export class UserResponseShort {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'alice', nullable: true })
  username!: string | null;

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678', nullable: true })
  walletAddress!: string | null;

  @ApiProperty({ example: 0 })
  reputation!: number;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseShort })
  user!: UserResponseShort;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIs...',
  })
  refreshToken!: string;
}
