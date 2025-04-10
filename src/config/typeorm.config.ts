import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../auth/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Wallet, Transaction],
  synchronize: process.env.NODE_ENV !== 'production', // Only synchronize in development
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
}; 