import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { SubmissionStatus, VerificationStatus, TaskStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification-types';
import { EventEmitterService } from '../websocket/event-emitter.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ManualVerifyDto } from './dto/manual-verify.dto';
import { SubmissionResponseDto } from './dto/submission-response.dto';

@Injectable()
export class SubmissionsService {
  private readonly logger = new Logger(SubmissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly notificationsService: NotificationsService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(
    taskId: string,
    workerId: string,
    dto: CreateSubmissionDto,
  ): Promise<SubmissionResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId } });

      if (!task || task.deletedAt) {
        throw new NotFoundException('Task not found');
      }

      if (task.status !== 'OPEN' && task.status !== 'IN_PROGRESS') {
        throw new ForbiddenException('Cannot submit to a task that is not open or in progress');
      }

      if (task.createdById === workerId) {
        throw new ForbiddenException('Task creator cannot submit work');
      }

      const worker = await tx.taskWorker.findUnique({
        where: { taskId_userId: { taskId, userId: workerId } },
      });

      if (!worker) {
        throw new ForbiddenException('Must join the task before submitting');
      }

      const existingSubmission = await tx.submission.findFirst({
        where: { taskId, workerId },
      });

      if (existingSubmission) {
        throw new ConflictException('Already submitted to this task');
      }

      const submission = await tx.submission.create({
        data: {
          content: dto.content,
          proof: dto.proof,
          taskId,
          workerId,
        },
      });

      await tx.taskWorker.update({
        where: { id: worker.id },
        data: { status: 'SUBMITTED' as string },
      });

      await tx.task.update({
        where: { id: taskId },
        data: { workersCompleted: { increment: 1 } },
      });

      // Check if all workers have completed - auto-complete task
      const updatedTask = await tx.task.findUnique({ where: { id: taskId } });
      if (updatedTask && updatedTask.workersCompleted >= updatedTask.workersRequired) {
        await tx.task.update({
          where: { id: taskId },
          data: { status: 'COMPLETED' as TaskStatus },
        });
        
        this.logger.log(`Task ${taskId} auto-completed: all ${updatedTask.workersRequired} workers finished`);
      }

      try {
        await this.notificationsService.createNotification({
          senderId: workerId,
          receiverId: task.createdById,
          type: NotificationType.SUBMISSION_RECEIVED,
          title: 'Submission Received',
          message: `A submission has been received for your task "${task.title}".`,
          metadata: { taskId, submissionId: submission.id, workerId },
        });
      } catch (error: unknown) {
        this.logger.error(
          `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      try {
        this.eventEmitter.emit('submission.created', {
          taskId,
          submissionId: submission.id,
          workerId,
        });
      } catch (error: unknown) {
        this.logger.error(
          `Failed to emit event: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      this.logger.log(
        `Submission created: ${submission.id} for task ${taskId} by worker ${workerId}`,
      );

      return this.mapSubmissionResponse(submission, null);
    });
  }

  async findByTask(taskId: string, _userId: string): Promise<SubmissionResponseDto[]> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });

    if (!task || task.deletedAt) {
      throw new NotFoundException('Task not found');
    }

    const submissions = await this.prisma.submission.findMany({
      where: { taskId },
      include: { verification: true },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map((s) => this.mapSubmissionResponse(s, s.verification));
  }

  async findOne(id: string): Promise<SubmissionResponseDto> {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { verification: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    return this.mapSubmissionResponse(submission, submission.verification);
  }

  async verifyAi(submissionId: string): Promise<SubmissionResponseDto> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true, verification: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const task = submission.task;

    if (task.verificationMode === 'MANUAL') {
      throw new ForbiddenException('This task requires manual verification only');
    }

    if (submission.verification) {
      throw new ConflictException('Submission has already been verified');
    }

    if (task.status === 'CANCELLED' || task.status === 'COMPLETED') {
      throw new ForbiddenException('Cannot verify a submission on a cancelled or completed task');
    }

    const result = await this.aiService.verifySubmission({
      taskTitle: task.title,
      taskDescription: task.description,
      taskRequirements: task.description,
      submissionContent: submission.content,
      submissionProof: submission.proof ?? undefined,
    });

    const verificationStatus: VerificationStatus = result.passed ? 'PASSED' : 'FAILED';
    const submissionStatus: SubmissionStatus = result.passed ? 'APPROVED' : 'REJECTED';

    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.verification.create({
        data: {
          status: verificationStatus,
          aiScore: result.score,
          aiFeedback: result.feedback,
          submissionId,
          isManual: false,
        },
      });

      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: submissionStatus },
        include: { verification: true },
      });

      return updatedSubmission;
    });

    const notifType =
      submissionStatus === 'APPROVED'
        ? NotificationType.SUBMISSION_APPROVED
        : NotificationType.SUBMISSION_REJECTED;
    const notifTitle =
      submissionStatus === 'APPROVED' ? 'Submission Approved' : 'Submission Rejected';
    const notifMessage =
      submissionStatus === 'APPROVED'
        ? `Your submission for task "${task.title}" has been approved.`
        : `Your submission for task "${task.title}" has been rejected.`;

    try {
      await this.notificationsService.createNotification({
        senderId: task.createdById,
        receiverId: submission.workerId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        metadata: { taskId: task.id, submissionId, verificationStatus },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    try {
      await this.notificationsService.createNotification({
        senderId: submission.workerId,
        receiverId: task.createdById,
        type: NotificationType.VERIFICATION_COMPLETED,
        title: 'AI Verification Completed',
        message: `AI verification has been completed for a submission on task "${task.title}".`,
        metadata: { taskId: task.id, submissionId, verificationStatus, mode: 'AI' },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    const eventName =
      submissionStatus === 'APPROVED' ? 'submission.approved' : 'submission.rejected';
    this.eventEmitter.emit(eventName, {
      taskId: task.id,
      submissionId,
      workerId: submission.workerId,
      status: submissionStatus,
    });

    this.eventEmitter.emit('verification.completed', {
      taskId: task.id,
      submissionId,
      workerId: submission.workerId,
      status: verificationStatus,
      mode: 'AI',
    });

    this.logger.log(
      `AI verification for submission ${submissionId}: ${verificationStatus} (score: ${result.score})`,
    );

    return this.mapSubmissionResponse(updated, updated.verification);
  }

  async verifyManual(
    submissionId: string,
    verifierId: string,
    dto: ManualVerifyDto,
  ): Promise<SubmissionResponseDto> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { task: true, verification: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const task = submission.task;

    if (task.verificationMode === 'AI') {
      throw new ForbiddenException('This task requires AI verification only');
    }

    if (task.createdById !== verifierId) {
      const verifier = await this.prisma.user.findUnique({ where: { id: verifierId } });
      if (!verifier || verifier.role !== 'ADMIN') {
        throw new ForbiddenException(
          'Only the task creator or an admin can perform manual verification',
        );
      }
    }

    if (submission.workerId === verifierId) {
      throw new ForbiddenException('Cannot verify your own submission');
    }

    if (task.status === 'CANCELLED' || task.status === 'COMPLETED') {
      throw new ForbiddenException('Cannot verify a submission on a cancelled or completed task');
    }

    const verificationStatus: VerificationStatus = dto.status === 'APPROVED' ? 'PASSED' : 'FAILED';
    const submissionStatus: SubmissionStatus = dto.status as SubmissionStatus;

    const updated = await this.prisma.$transaction(async (tx) => {
      if (submission.verification) {
        await tx.verification.update({
          where: { id: submission.verification.id },
          data: {
            status: verificationStatus,
            manualNotes: dto.manualNotes,
            isManual: true,
            verifiedById: verifierId,
          },
        });
      } else {
        await tx.verification.create({
          data: {
            status: verificationStatus,
            manualNotes: dto.manualNotes,
            submissionId,
            isManual: true,
            verifiedById: verifierId,
          },
        });
      }

      const updatedSubmission = await tx.submission.update({
        where: { id: submissionId },
        data: { status: submissionStatus },
        include: { verification: true },
      });

      return updatedSubmission;
    });

    const notifType =
      submissionStatus === 'APPROVED'
        ? NotificationType.SUBMISSION_APPROVED
        : NotificationType.SUBMISSION_REJECTED;
    const notifTitle =
      submissionStatus === 'APPROVED' ? 'Submission Approved' : 'Submission Rejected';
    const notifMessage =
      submissionStatus === 'APPROVED'
        ? `Your submission for task "${task.title}" has been approved.`
        : `Your submission for task "${task.title}" has been rejected.`;

    try {
      await this.notificationsService.createNotification({
        senderId: task.createdById,
        receiverId: submission.workerId,
        type: notifType,
        title: notifTitle,
        message: notifMessage,
        metadata: { taskId: task.id, submissionId, verificationStatus },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    try {
      await this.notificationsService.createNotification({
        senderId: verifierId,
        receiverId: task.createdById,
        type: NotificationType.VERIFICATION_COMPLETED,
        title: 'Manual Verification Completed',
        message: `Manual verification has been completed for a submission on task "${task.title}".`,
        metadata: { taskId: task.id, submissionId, verificationStatus, mode: 'MANUAL' },
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create notification: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    const manualEventName =
      submissionStatus === 'APPROVED' ? 'submission.approved' : 'submission.rejected';
    this.eventEmitter.emit(manualEventName, {
      taskId: task.id,
      submissionId,
      workerId: submission.workerId,
      status: submissionStatus,
    });

    this.eventEmitter.emit('verification.completed', {
      taskId: task.id,
      submissionId,
      workerId: submission.workerId,
      status: verificationStatus,
      mode: 'MANUAL',
    });

    this.logger.log(
      `Manual verification for submission ${submissionId}: ${verificationStatus} by user ${verifierId}`,
    );

    return this.mapSubmissionResponse(updated, updated.verification);
  }

  private mapSubmissionResponse(
    submission: {
      id: string;
      content: string;
      proof: string | null;
      status: SubmissionStatus;
      aiScore: number | null;
      aiFeedback: string | null;
      taskId: string;
      workerId: string;
      createdAt: Date;
      updatedAt: Date;
    },
    verification: {
      id: string;
      status: VerificationStatus;
      aiScore: number | null;
      aiFeedback: string | null;
      manualNotes: string | null;
      isManual: boolean;
      verifiedById: string | null;
    } | null,
  ): SubmissionResponseDto {
    return {
      id: submission.id,
      content: submission.content,
      proof: submission.proof,
      status: submission.status,
      aiScore: submission.aiScore,
      aiFeedback: submission.aiFeedback,
      taskId: submission.taskId,
      workerId: submission.workerId,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      verification: verification
        ? {
            id: verification.id,
            status: verification.status,
            aiScore: verification.aiScore,
            aiFeedback: verification.aiFeedback,
            manualNotes: verification.manualNotes,
            isManual: verification.isManual,
            verifiedById: verification.verifiedById,
          }
        : null,
    };
  }
}
