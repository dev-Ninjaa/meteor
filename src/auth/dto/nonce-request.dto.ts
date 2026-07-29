import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from '../../common/decorators/is-ethereum-address.decorator';

export class NonceRequestDto {
  @ApiProperty({
    description: 'Wallet address to request nonce for',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsEthereumAddress()
  walletAddress!: string;
}
