import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress } from '../../common/decorators/is-ethereum-address.decorator';

export class VerifyRequestDto {
  @ApiProperty({
    description: 'Wallet address that signed the nonce',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  @IsString()
  @IsEthereumAddress()
  walletAddress!: string;

  @ApiProperty({
    description: 'Signature of the nonce signed by the wallet',
    example: '0xabcdef...',
  })
  @IsString()
  signature!: string;
}
