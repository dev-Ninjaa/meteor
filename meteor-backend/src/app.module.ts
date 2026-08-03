import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_PIPE, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';

import {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  swaggerConfig,
  geminiConfig,
  monadConfig,
} from './config';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './redis/redis.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { AiModule } from './ai/ai.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        swaggerConfig,
        geminiConfig,
        monadConfig,
      ],
    }),
    PrismaModule,
    RedisModule,
    BlockchainModule,
    AuthModule,
    UsersModule,
    TasksModule,
    MarketplaceModule,
    AiModule,
    SubmissionsModule,
    PaymentsModule,
    NotificationsModule,
    WebSocketModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_PIPE,
      useClass: GlobalValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
