import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsPositive, IsNotEmpty } from 'class-validator';

export class ConvertCurrencyDto {
    @ApiProperty({
        description: 'Source currency code',
        example: 'USD',
    })
    @IsString()
    @IsNotEmpty()
    sourceCurrency: string;

    @ApiProperty({
        description: 'Target currency code',
        example: 'EUR',
    })
    @IsString()
    @IsNotEmpty()
    targetCurrency: string;

    @ApiProperty({
        description: 'Amount to convert',
        example: 100.50,
        minimum: 0.01,
    })
    @IsNumber()
    @IsPositive()
    amount: number;
} 