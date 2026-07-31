import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { recoverMessageAddress } from 'viem';
import { randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { AuthResponseDto, UserResponseShort } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {}

  async requestNonce(walletAddress: string): Promise<{ nonce: string; walletAddress: string }> {
    const nonce = randomBytes(32).toString('hex');

    const existing = await this.prisma.user.findFirst({
      where: { walletAddress },
    });

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: { nonce },
      });
    } else {
      await this.prisma.user.create({
        data: {
          walletAddress,
          nonce,
        },
      });
    }

    this.logger.log(`Nonce generated for wallet ${walletAddress}`);

    return { nonce, walletAddress };
  }

  async verifySignature(walletAddress: string, signature: string): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user || !user.nonce) {
      throw new UnauthorizedException('No nonce requested for this wallet');
    }

    let recoveredAddress: string;
    try {
      recoveredAddress = await recoverMessageAddress({
        message: user.nonce,
        signature: signature as `0x${string}`,
      });
    } catch {
      throw new UnauthorizedException('Invalid signature format');
    }

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      throw new UnauthorizedException('Signature does not match wallet address');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { nonce: null },
    });

    const tokens = await this.generateTokens(user.id, user.username, walletAddress, user.role);

    const userResponse: UserResponseShort = {
      id: user.id,
      username: user.username,
      walletAddress: user.walletAddress,
      reputation: user.reputation,
    };

    this.logger.log(`Wallet verified for ${walletAddress}`);

    return { user: userResponse, ...tokens };
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const expiresIn =
        parseInt(this.configService.get<string>('jwt.expiration', '900'), 10) || 900;
      const refreshExpiresIn =
        parseInt(this.configService.get<string>('jwt.refreshExpiration', '604800'), 10) || 604800;

      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.secret'),
      }) as {
        sub: string;
        username: string | null;
        walletAddress: string;
        role: string;
        type: string;
      };

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, walletAddress: true, role: true, deletedAt: true },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('User not found or deactivated');
      }

      const accessToken = this.jwtService.sign(
        {
          sub: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          role: user.role,
          type: 'access',
        },
        { expiresIn },
      );

      const newRefreshToken = this.jwtService.sign(
        {
          sub: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
          role: user.role,
          type: 'refresh',
        },
        { expiresIn: refreshExpiresIn },
      );

      return { accessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(accessToken: string): Promise<void> {
    try {
      const payload = this.jwtService.decode(accessToken) as { exp: number } | null;
      if (payload && payload.exp) {
        const ttl = payload.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.redis.set(`blacklist:${accessToken}`, 'true', ttl);
        }
      }
    } catch {
      this.logger.warn('Failed to blacklist token during logout');
    }

    this.logger.log('User logged out');
  }

  private async generateTokens(
    userId: string,
    username: string | null,
    walletAddress: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const expiresIn = parseInt(this.configService.get<string>('jwt.expiration', '900'), 10) || 900;
    const refreshExpiresIn =
      parseInt(this.configService.get<string>('jwt.refreshExpiration', '604800'), 10) || 604800;

    const accessToken = this.jwtService.sign(
      { sub: userId, username, walletAddress, role, type: 'access' },
      { expiresIn },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, username, walletAddress, role, type: 'refresh' },
      { expiresIn: refreshExpiresIn },
    );

    return { accessToken, refreshToken };
  }
}
