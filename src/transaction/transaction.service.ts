import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionType, TransactionStatus } from './entities/transaction.entity';
import { WalletService } from '../wallet/wallet.service';
import { FxService } from '../fx/fx.service';

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @Inject(forwardRef(() => WalletService))
        private walletService: WalletService,
        private fxService: FxService,
    ) {}
    
    async createTransaction(transactionData: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.transactionRepository.create({
            ...transactionData,
            type: transactionData.type as TransactionType,
            status: transactionData.status as TransactionStatus
        });
        return this.transactionRepository.save(transaction);
    }
    
    async getTransactionsByUserId(userId: string, limit = 50, offset = 0): Promise<Transaction[]> {
        return this.transactionRepository.find({
            where: { userId },
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    
    async updateLastTransaction(userId: string, type: TransactionType): Promise<void> {
        // Find the most recent transaction for this user
        const lastTransaction = await this.transactionRepository.findOne({
            where: { userId },
            order: { timestamp: 'DESC' },
        });
        
        if (lastTransaction) {
            lastTransaction.type = type;
            await this.transactionRepository.save(lastTransaction);
        }
    }
}
