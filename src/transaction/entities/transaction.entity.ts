import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

export enum TransactionType {
    FUNDING = 'FUNDING',
    CONVERSION = 'CONVERSION',
    TRADE = 'TRADE'
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED'
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
    enumName: 'transaction_type_enum'
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

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    enumName: 'transaction_status_enum'
  })
  status: TransactionStatus;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp: Date;
} 