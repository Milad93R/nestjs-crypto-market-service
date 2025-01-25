import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import { sleep } from '../../common/utils/time.utils';

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly client: AxiosInstance;
  private readonly requestDelay: number;

  constructor(private readonly configService: ConfigService) {
    const apiUrl = this.configService.get<string>('coingecko.apiUrl') ?? 'https://api.coingecko.com/api/v3';
    const apiKey = this.configService.get<string>('coingecko.apiKey');
    this.requestDelay = this.configService.get<number>('coingecko.requestDelay') ?? 1000;

    this.client = axios.create({
      baseURL: apiUrl,
      headers: apiKey ? { 'X-CG-API-KEY': apiKey } : {},
    });

    // Configure retry behavior
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: (retryCount) => retryCount * 1000, // Progressive delay
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          error.response?.status === 429; // Rate limit error
      },
    });
  }

  async fetchTopCoins(): Promise<CoinGeckoMarket[]> {
    try {
      const limit = this.configService.get<number>('coingecko.topCoinsLimit') ?? 100;
      const response = await this.client.get<CoinGeckoMarket[]>('/coins/markets', {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: limit,
          page: 1,
          sparkline: false,
        },
      });

      await sleep(this.requestDelay);
      return response.data;
    } catch (error) {
      this.logger.error(`Error fetching top coins: ${error.message}`, error.stack);
      throw error;
    }
  }
} 