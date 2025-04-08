import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ExchangeRateResponse } from './interfaces/exchange-rate.interface';

@Injectable()
export class FxService {
    private readonly API_URL = 'https://v6.exchangerate-api.com/v6/3320973059801dc97b4ca02b/latest';
    private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds

    constructor(
        private httpService: HttpService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    async getExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRateResponse> {
        const cacheKey = `fx_rates_${baseCurrency}`;
        
        // Try to get from cache first
        const cachedRates = await this.cacheManager.get<ExchangeRateResponse>(cacheKey);
        if (cachedRates) {
          return cachedRates;
        }
    
        // If not in cache, fetch from API
        try {
          const response = await firstValueFrom(
            this.httpService.get<ExchangeRateResponse>(`${this.API_URL}/${baseCurrency}`).pipe(
              catchError((error: AxiosError) => {
                throw new HttpException(
                  `Failed to fetch exchange rates: ${error.message}`,
                  HttpStatus.SERVICE_UNAVAILABLE,
                );
              }),
            ),
          );
    
          // Store in cache
          await this.cacheManager.set(cacheKey, response.data, this.CACHE_TTL);
          return response.data;
        } catch (error) {
          throw new HttpException(
            'Failed to fetch exchange rates',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }
    }

    async getExchangeRate(sourceCurrency: string, targetCurrency: string): Promise<number> {
        // Get rates with source currency as base
        const rates = await this.getExchangeRates(sourceCurrency);
        
        if (!rates.conversion_rates || !rates.conversion_rates[targetCurrency]) {
            throw new HttpException(
                `Exchange rate not available for ${sourceCurrency} to ${targetCurrency}`,
                HttpStatus.BAD_REQUEST,
            );
        }
        
        return rates.conversion_rates[targetCurrency];
    }
}
