import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class FundWalletDto {
    @ApiProperty({
        description: 'Currency code (e.g., USD, EUR, GBP)',
        example: 'USD',
    })
    @IsString()
    currency: string;

    @ApiProperty({
        description: 'Amount to fund',
        example: 100.50,
        minimum: 0.01,
    })
    @IsNumber()
    @IsPositive()
    amount: number;
} 