import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';
import { FxService } from '../fx/fx.service';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionType, TransactionStatus } from '../transaction/entities/transaction.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepository: Repository<Wallet>,
        private dataSource: DataSource,
        private fxService: FxService,
        @Inject(forwardRef(() => TransactionService))
        private transactionService: TransactionService,
    ) {}

    async getWalletsByUserId(userId: string): Promise<Wallet[]> {
        return this.walletRepository.find({ where: { userId } });
    }

    async getOrCreateWallet(userId: string, currency: string): Promise<Wallet> {
        let wallet = await this.walletRepository.findOne({
            where: { userId, currency },
        });

        if (!wallet) {
            wallet = this.walletRepository.create({
                userId,
                currency,
                balance: 0,
            });
            await this.walletRepository.save(wallet);
        }

        return wallet;
    }

    async fundWallet(userId: string, currency: string, amount: number): Promise<Wallet> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than zero');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get wallet with pessimistic lock to prevent race conditions
            const wallet = await queryRunner.manager.findOne(Wallet, {
                where: { userId, currency },
                lock: { mode: 'pessimistic_write' },
            });

            if (!wallet) {
                // Create wallet if it doesn't exist
                const newWallet = queryRunner.manager.create(Wallet, {
                    userId,
                    currency,
                    balance: amount,
                });
                await queryRunner.manager.save(newWallet);
                
                // Record transaction
                await this.transactionService.createTransaction({
                    userId,
                    type: TransactionType.FUNDING,
                    sourceCurrency: currency,
                    sourceAmount: amount,
                    targetCurrency: currency,
                    targetAmount: amount,
                    rate: 1,
                    status: TransactionStatus.COMPLETED,
                });

                await queryRunner.commitTransaction();
                return newWallet;
            }

            // Update existing wallet
            wallet.balance += amount;
            await queryRunner.manager.save(wallet);
            
            // Record transaction
            await this.transactionService.createTransaction({
                userId,
                type: TransactionType.FUNDING,
                sourceCurrency: currency,
                sourceAmount: amount,
                targetCurrency: currency,
                targetAmount: amount,
                rate: 1,
                status: TransactionStatus.COMPLETED,
            });

            await queryRunner.commitTransaction();
            return wallet;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async convertCurrency(
        userId: string,
        sourceCurrency: string,
        targetCurrency: string,
        amount: number,
    ): Promise<{ sourceWallet: Wallet; targetWallet: Wallet; rate: number }> {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than zero');
        }

        if (sourceCurrency === targetCurrency) {
            throw new BadRequestException('Source and target currencies cannot be the same');
        }

        // Get latest exchange rate
        const rate = await this.fxService.getExchangeRate(sourceCurrency, targetCurrency);
        const convertedAmount = amount * rate;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Get source wallet with lock
            const sourceWallet = await queryRunner.manager.findOne(Wallet, {
                where: { userId, currency: sourceCurrency },
                lock: { mode: 'pessimistic_write' },
            });

            if (!sourceWallet) {
                throw new NotFoundException(`Wallet for ${sourceCurrency} not found`);
            }

            if (sourceWallet.balance < amount) {
                throw new BadRequestException('Insufficient balance');
            }

            // Get or create target wallet
            let targetWallet = await queryRunner.manager.findOne(Wallet, {
                where: { userId, currency: targetCurrency },
                lock: { mode: 'pessimistic_write' },
            });

            if (!targetWallet) {
                targetWallet = queryRunner.manager.create(Wallet, {
                    userId,
                    currency: targetCurrency,
                    balance: 0,
                });
            }

            // Update balances
            sourceWallet.balance -= amount;
            targetWallet.balance += convertedAmount;

            // Save changes
            await queryRunner.manager.save(sourceWallet);
            await queryRunner.manager.save(targetWallet);

            // Record transaction
            await this.transactionService.createTransaction({
                userId,
                type: TransactionType.CONVERSION,
                sourceCurrency,
                sourceAmount: amount,
                targetCurrency,
                targetAmount: convertedAmount,
                rate,
                status: TransactionStatus.COMPLETED,
            });

            await queryRunner.commitTransaction();
            return { sourceWallet, targetWallet, rate };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async tradeCurrency(
        userId: string, 
        sourceCurrency: string, 
        targetCurrency: string, 
        amount: number
    ): Promise<{ sourceWallet: Wallet; targetWallet: Wallet; rate: number }> {
        const result = await this.convertCurrency(userId, sourceCurrency, targetCurrency, amount);
        
        // Update the transaction type to TRADE
        await this.transactionService.updateLastTransaction(userId, TransactionType.TRADE);
        
        return result;
    }
}
