import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WebSocketGateway } from './websocket.gateway';
import { EventEmitterService } from './event-emitter.service';

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>(
          'jwt.secret',
          'super-secret-jwt-key-change-in-production',
        ),
        signOptions: {
          expiresIn: parseInt(configService.get<string>('jwt.expiration', '900'), 10) || 900,
        },
      }),
    }),
  ],
  providers: [WebSocketGateway, EventEmitterService],
  exports: [EventEmitterService],
})
export class WebSocketModule {}
