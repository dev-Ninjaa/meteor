import { Global, Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { PrismaModule } from '../database/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
