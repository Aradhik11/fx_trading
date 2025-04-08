import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Transaction } from './transaction.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.wallets)
  user: User;

  @Column()
  userId: string;

  @Column()
  currency: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  balance: number;

  @OneToMany(() => Transaction, transaction => transaction.sourceWallet)
  transactions: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.targetWallet)
  receivedTransactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 