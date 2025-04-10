import { Controller, Get, Post, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { User } from '../auth/decorators/user.decorator';
import { Transaction } from './entities/transaction.entity';

@ApiTags('transactions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) {}

    @Get()
    @ApiOperation({ summary: 'Get all transactions for the authenticated user' })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of transactions to return (default: 50)' })
    @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Number of transactions to skip (default: 0)' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns all transactions for the authenticated user',
        type: [Transaction],
    })
    getTransactions(
        @User() user,
        @Query('limit') limit?: number,
        @Query('offset') offset?: number,
    ) {
        return this.transactionService.getTransactionsByUserId(user.id, limit, offset);
    }
}
