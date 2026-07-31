import { ApiProperty } from '@nestjs/swagger';

export class NonceResponseDto {
  @ApiProperty({
    description: 'Nonce to sign with wallet',
    example: 'a1b2c3d4e5f6...',
  })
  nonce!: string;

  @ApiProperty({
    description: 'Wallet address the nonce is intended for',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress!: string;
}
