import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserResponse(user);
  }

  async updateMe(userId: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existing || existing.deletedAt) {
      throw new NotFoundException('User not found');
    }

    if (dto.username) {
      const duplicate = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });

      if (duplicate && duplicate.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const updateData: Prisma.UserUpdateInput = {};
    if (dto.username !== undefined) {
      updateData.username = dto.username;
    }
    if (dto.avatarUrl !== undefined) {
      updateData.avatarUrl = dto.avatarUrl;
    }
    if (dto.bio !== undefined) {
      updateData.bio = dto.bio;
    }
    if (dto.metadata !== undefined) {
      updateData.metadata = dto.metadata as Prisma.InputJsonValue;
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    this.logger.log(`User ${userId} updated profile`);

    return this.mapUserResponse(user);
  }

  async findByWalletAddress(walletAddress: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { walletAddress },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserResponse(user);
  }

  private mapUserResponse(user: {
    id: string;
    username: string | null;
    avatarUrl: string | null;
    bio: string | null;
    walletAddress: string | null;
    reputation: number;
    role: string;
    metadata: unknown;
    createdAt: Date;
  }): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      walletAddress: user.walletAddress,
      reputation: user.reputation,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
