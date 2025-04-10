import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';

export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    TRANSFER = 'transfer',
    EXCHANGE = 'exchange',
    TRADE = 'trade'
}

export enum TransactionStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed'
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: TransactionType,
    enumName: 'transactions_type_enum',
    default: TransactionType.DEPOSIT
  })
  type: TransactionType;

  @Column()
  sourceCurrency: string;

  @Column('decimal', { precision: 18, scale: 8 })
  sourceAmount: number;

  @Column()
  targetCurrency: string;

  @Column('decimal', { precision: 18, scale: 8 })
  targetAmount: number;

  @Column('decimal', { precision: 18, scale: 8 })
  rate: number;

  @Column({ nullable: true })
  targetUserId: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transactions_status_enum',
    default: TransactionStatus.PENDING
  })
  status: TransactionStatus;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;

  @Column('decimal', { precision: 18, scale: 8 })
  amount: number;

  @ManyToOne(() => Wallet, { nullable: true })
  sourceWallet: Wallet;

  @Column({ nullable: true })
  sourceWalletId: string;

  @ManyToOne(() => Wallet, { nullable: true })
  targetWallet: Wallet;

  @Column({ nullable: true })
  targetWalletId: string;
} 