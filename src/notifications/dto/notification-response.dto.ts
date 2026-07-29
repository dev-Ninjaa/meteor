import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'TASK_PUBLISHED' })
  type!: string;

  @ApiProperty({ example: 'Task Published' })
  title!: string;

  @ApiProperty({ example: 'Your task "Build a landing page" has been published.' })
  message!: string;

  @ApiProperty({ example: false })
  read!: boolean;

  @ApiPropertyOptional({ example: { taskId: '...' } })
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'sender-uuid' })
  senderId?: string | null;

  @ApiProperty({ example: 'receiver-uuid' })
  receiverId!: string;

  @ApiProperty({ example: '2026-07-29T12:00:00.000Z' })
  createdAt!: Date;
}
