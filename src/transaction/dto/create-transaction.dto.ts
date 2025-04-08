import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsNotEmpty, IsEnum } from 'class-validator';

export enum TransactionType {
    FUNDING = 'FUNDING',
    CONVERSION = 'CONVERSION',
    TRADE = 'TRADE',
}

export enum TransactionStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export class CreateTransactionDto {
    @ApiProperty({
        description: 'Type of transaction',
        enum: TransactionType,
        example: TransactionType.FUNDING,
    })
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({
        description: 'Source currency code',
        example: 'USD',
    })
    @IsString()
    @IsNotEmpty()
    sourceCurrency: string;

    @ApiProperty({
        description: 'Source amount',
        example: 100.50,
        minimum: 0.01,
    })
    @IsNumber()
    @IsPositive()
    sourceAmount: number;

    @ApiProperty({
        description: 'Target currency code',
        example: 'EUR',
    })
    @IsString()
    @IsNotEmpty()
    targetCurrency: string;

    @ApiProperty({
        description: 'Target amount',
        example: 85.25,
        minimum: 0.01,
    })
    @IsNumber()
    @IsPositive()
    targetAmount: number;

    @ApiProperty({
        description: 'Exchange rate',
        example: 0.8525,
        minimum: 0.0001,
    })
    @IsNumber()
    @IsPositive()
    rate: number;

    @ApiProperty({
        description: 'Transaction status',
        enum: TransactionStatus,
        example: TransactionStatus.COMPLETED,
    })
    @IsEnum(TransactionStatus)
    status: TransactionStatus;
} 