import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService, TransactionResponse } from './payments.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { ReleaseEscrowDto } from './dto/release-escrow.dto';
import { RefundEscrowDto } from './dto/refund-escrow.dto';
import { ClaimEscrowDto } from './dto/claim-escrow.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('escrow/create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create escrow for a task (creator only)' })
  @ApiResponse({ status: 201, description: 'Escrow created' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 409, description: 'Escrow already exists' })
  async createEscrow(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateEscrowDto,
  ): Promise<TransactionResponse> {
    return this.paymentsService.createEscrow(userId, dto);
  }

  @Post('escrow/release')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release escrow payment to a worker (creator only)' })
  @ApiResponse({ status: 201, description: 'Escrow released' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task or submission not found' })
  @ApiResponse({ status: 409, description: 'Escrow not locked' })
  async releaseEscrow(
    @CurrentUser('sub') userId: string,
    @Body() dto: ReleaseEscrowDto,
  ): Promise<TransactionResponse> {
    return this.paymentsService.releaseEscrow(userId, dto);
  }

  @Post('escrow/refund')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Refund escrow (creator only, task must be cancelled or all submissions rejected)',
  })
  @ApiResponse({ status: 201, description: 'Escrow refunded' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 409, description: 'Escrow not locked' })
  async refundEscrow(
    @CurrentUser('sub') userId: string,
    @Body() dto: RefundEscrowDto,
  ): Promise<TransactionResponse> {
    return this.paymentsService.refundEscrow(userId, dto);
  }

  @Post('escrow/claim')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim escrow payment after passing verification (worker only)' })
  @ApiResponse({ status: 201, description: 'Payment claimed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Submission not found' })
  @ApiResponse({ status: 409, description: 'Already claimed' })
  async claimEscrow(
    @CurrentUser('sub') userId: string,
    @Body() dto: ClaimEscrowDto,
  ): Promise<TransactionResponse> {
    return this.paymentsService.claimEscrow(userId, dto);
  }

  @Get('transactions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List transactions with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Paginated transaction list' })
  async findTransactions(
    @CurrentUser('sub') userId: string,
    @Query() query: QueryTransactionsDto,
  ): Promise<{
    data: TransactionResponse[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.paymentsService.findTransactions(userId, query);
  }

  @Get('transactions/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction found' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async findTransaction(@Param('id') id: string): Promise<TransactionResponse> {
    return this.paymentsService.findTransaction(id);
  }
}
