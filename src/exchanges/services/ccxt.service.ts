import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ccxt from 'ccxt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Candle } from '../../exchanges/entities/candle.entity';
import { ExchangeTimeframeConfig } from '../../config/configuration';

@Injectable()
export class CCXTService {
  private readonly logger = new Logger(CCXTService.name);
  private ccxtInstances: { [key: string]: ccxt.Exchange } = {};
  private readonly timeframes: string[];
  private readonly exchangeConfigs: ExchangeTimeframeConfig[];
  private readonly BATCH_SIZE = 1000;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Candle)
    private readonly candleRepository: Repository<Candle>
  ) {
    this.timeframes = this.configService.get('candleIntervals') || ['1h', '4h', '1d'];
    this.exchangeConfigs = this.configService.get('exchanges') || [];
  }

  async onModuleInit() {
    await this.initializeExchanges();
  }

  private async initializeExchanges() {
    try {
      const uniqueExchanges = [...new Set(this.exchangeConfigs.map(config => config.name))];
      
      for (const exchangeName of uniqueExchanges) {
        if (!ccxt[exchangeName]) {
          this.logger.warn(`Exchange ${exchangeName} not found in CCXT`);
          continue;
        }

        try {
          const exchangeInstance = new ccxt[exchangeName]({
            enableRateLimit: true,
            timeout: 30000,
          });

          // Set rate limits with buffer
          if (exchangeInstance.rateLimit) {
            exchangeInstance.rateLimit = Math.ceil(exchangeInstance.rateLimit * 1.1);
          }

          this.ccxtInstances[exchangeName] = exchangeInstance;
          this.logger.log(`Initialized ${exchangeName} exchange`);
        } catch (error) {
          this.logger.error(`Failed to initialize ${exchangeName}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize exchanges:', error);
      throw error;
    }
  }

  async fetchCandles(coin: string, exchange: string): Promise<void> {
    try {
      const exchangeInstance = this.ccxtInstances[exchange];
      if (!exchangeInstance) {
        throw new Error(`Exchange ${exchange} not initialized`);
      }

      const symbol = this.formatSymbol(coin);
      const exchangeTimeframes = this.exchangeConfigs.filter(config => config.name === exchange);

      for (const config of exchangeTimeframes) {
        try {
          const since = await this.calculateSince(coin, exchange, config.status, config.timeframe);
          const candles = await exchangeInstance.fetchOHLCV(symbol, config.timeframe, since);
          
          await this.saveCandles(candles, coin, exchange);
          this.logger.log(`Fetched ${candles.length} ${config.timeframe} candles for ${symbol} from ${exchange}`);
          
          // Add delay between requests to respect rate limits
          await new Promise(resolve => setTimeout(resolve, exchangeInstance.rateLimit || 1000));
        } catch (error) {
          this.logger.error(`Failed to fetch ${config.timeframe} candles for ${symbol} from ${exchange}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to process candles for ${coin} from ${exchange}: ${error.message}`);
      throw error;
    }
  }

  private async calculateSince(coin: string, exchange: string, status: number, timeframe: string): Promise<number | undefined> {
    if (status === 2) {
      // For status 2, get last 1000 candles
      const multiplier = this.getTimeframeMultiplier(timeframe);
      return Date.now() - (1000 * multiplier * 1000);
    }

    // For status 1, get from last stored timestamp or earliest possible
    return await this.getLastStoredTimestamp(coin, exchange, timeframe);
  }

  private getTimeframeMultiplier(timeframe: string): number {
    const units = {
      'h': 60 * 60,
      'd': 24 * 60 * 60
    };
    
    const value = parseInt(timeframe);
    const unit = timeframe.slice(-1);
    
    return value * (units[unit] || 60);
  }

  private async getLastStoredTimestamp(coin: string, exchange: string, timeframe: string): Promise<number | undefined> {
    try {
      // Get the timeframe in milliseconds
      const timeframeMs = this.getTimeframeMultiplier(timeframe) * 1000;
      
      const lastCandle = await this.candleRepository.findOne({
        where: {
          symbol: coin,
          exchange: exchange
        },
        order: {
          timestamp: 'DESC'
        }
      });

      if (!lastCandle) {
        return undefined;
      }

      // Return the next timestamp based on the timeframe
      return lastCandle.timestamp + timeframeMs;
    } catch (error) {
      this.logger.error(`Failed to get last stored timestamp: ${error.message}`);
      return undefined;
    }
  }

  private async saveCandles(candles: ccxt.OHLCV[], coin: string, exchange: string): Promise<void> {
    try {
      const candleEntities = candles.map(candle => {
        const [timestamp, open, high, low, close, volume] = candle;
        return {
          symbol: coin,
          exchange,
          timestamp,
          open,
          high,
          low,
          close,
          volume
        };
      });

      // Use upsert to handle duplicates
      await this.candleRepository
        .createQueryBuilder()
        .insert()
        .into(Candle)
        .values(candleEntities)
        .orUpdate(
          ['open', 'high', 'low', 'close', 'volume', 'updatedAt'],
          ['symbol', 'exchange', 'timestamp']
        )
        .execute();
    } catch (error) {
      this.logger.error(`Failed to save candles: ${error.message}`);
      throw error;
    }
  }

  private formatSymbol(coin: string): string {
    return `${coin}/USDT`;
  }

  getInitializedExchanges(): string[] {
    return Object.keys(this.ccxtInstances);
  }

  async getCandles(
    symbol: string,
    exchange: string,
    timeframe: string,
    startTime?: number,
    endTime?: number,
    limit = 100,
    page = 1
  ): Promise<{ candles: Candle[]; total: number }> {
    try {
      const queryBuilder = this.candleRepository.createQueryBuilder('candle')
        .where('candle.symbol = :symbol', { symbol })
        .andWhere('candle.exchange = :exchange', { exchange });

      if (startTime) {
        queryBuilder.andWhere('candle.timestamp >= :startTime', { startTime });
      }

      if (endTime) {
        queryBuilder.andWhere('candle.timestamp <= :endTime', { endTime });
      }

      const [candles, total] = await queryBuilder
        .orderBy('candle.timestamp', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getManyAndCount();

      return { candles, total };
    } catch (error) {
      this.logger.error(`Failed to get candles: ${error.message}`);
      throw error;
    }
  }

  async getExchangeTimeframeStatus(exchange: string, timeframe: string): Promise<number | undefined> {
    const config = this.exchangeConfigs.find(
      c => c.name === exchange && c.timeframe === timeframe
    );
    return config?.status;
  }

  async fetchCandlesFromCCXT(
    symbol: string, 
    exchange: string, 
    timeframe: string, 
    since?: number,
    limit: number = 1000
  ): Promise<any[]> {
    try {
      const exchangeInstance = this.ccxtInstances[exchange];
      if (!exchangeInstance) {
        throw new Error(`Exchange ${exchange} not initialized`);
      }

      const formattedSymbol = this.formatSymbol(symbol);
      
      // Fetch candles from CCXT using provided limit
      const candles = await exchangeInstance.fetchOHLCV(formattedSymbol, timeframe, since, limit, {
        limit: limit
      });
      
      // Add delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, exchangeInstance.rateLimit || 1000));

      // Transform the CCXT response into our format
      return candles.map(candle => {
        const [timestamp, open, high, low, close, volume] = candle;
        return {
          timestamp,
          open,
          high,
          low,
          close,
          volume
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch candles from CCXT for ${symbol} on ${exchange}: ${error.message}`);
      throw error;
    }
  }
} 