import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FxService } from './fx.service';
import { ExchangeRateResponse } from './interfaces/exchange-rate.interface';

@ApiTags('fx')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('fx')
export class FxController {
    constructor(private readonly fxService: FxService) {}

    @Get('rates')
    @ApiOperation({ summary: 'Get exchange rates for a base currency' })
    @ApiQuery({ 
        name: 'base', 
        required: false, 
        type: String, 
        description: 'Base currency code (default: USD)',
        example: 'USD',
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns exchange rates for the specified base currency',
        type: Object,
        schema: {
            properties: {
                result: { type: 'string', example: 'success' },
                base_code: { type: 'string', example: 'USD' },
                conversion_rates: {
                    type: 'object',
                    example: {
                        EUR: 0.92,
                        GBP: 0.79,
                        NGN: 1597.14,
                    },
                },
                time_last_update_utc: { type: 'string', example: '2024-04-08 00:00:01 UTC' }
            }
        }
    })
    @ApiResponse({ 
        status: 401, 
        description: 'Unauthorized - Invalid or missing JWT token',
    })
    async getRates(@Query('base') baseCurrency: string = 'USD'): Promise<ExchangeRateResponse> {
        return this.fxService.getExchangeRates(baseCurrency);
    }
}
