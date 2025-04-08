import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { User } from '../auth/decorators/user.decorator';
import { FundWalletDto } from './dto/fund-wallet.dto';
import { ConvertCurrencyDto } from './dto/convert-currency.dto';
import { Wallet } from './entities/wallet.entity';

@ApiTags('wallet')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}

    @Get()
    @ApiOperation({ summary: 'Get all wallets for the authenticated user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns all wallets for the authenticated user',
        type: [Wallet],
    })
    getWallets(@User() user) {
        return this.walletService.getWalletsByUserId(user.id);
    }

    @Post('fund')
    @ApiOperation({ summary: 'Fund a wallet with a specific currency' })
    @ApiResponse({ 
        status: 201, 
        description: 'Wallet funded successfully',
        type: Wallet,
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid amount or currency',
    })
    fundWallet(
        @User() user,
        @Body() fundDto: FundWalletDto,
    ) {
        return this.walletService.fundWallet(user.id, fundDto.currency, fundDto.amount);
    }

    @Post('convert')
    @ApiOperation({ summary: 'Convert currency between wallets' })
    @ApiResponse({ 
        status: 201, 
        description: 'Currency converted successfully',
        type: Wallet,
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid conversion parameters',
    })
    convertCurrency(
        @User() user,
        @Body() convertDto: ConvertCurrencyDto,
    ) {
        return this.walletService.convertCurrency(
            user.id,
            convertDto.sourceCurrency,
            convertDto.targetCurrency,
            convertDto.amount,
        );
    }

    @Post('trade')
    @ApiOperation({ summary: 'Trade currency between wallets' })
    @ApiResponse({ 
        status: 201, 
        description: 'Trade executed successfully',
        type: Wallet,
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid trade parameters',
    })
    tradeCurrency(
        @User() user,
        @Body() tradeDto: ConvertCurrencyDto,
    ) {
        return this.walletService.tradeCurrency(
            user.id,
            tradeDto.sourceCurrency,
            tradeDto.targetCurrency,
            tradeDto.amount,
        );
    }
}
