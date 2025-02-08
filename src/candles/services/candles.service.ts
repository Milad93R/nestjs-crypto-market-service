import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { Candle } from '../entities/candle.entity';
import { CoinExchange } from '../../exchanges/entities/coin-exchange.entity';
import { CCXTService } from '../../exchanges/services/ccxt.service';
import { ProcessingResult, ProcessingResponse } from '../types/processing-result.type';

@Injectable()
export class CandlesService {
  private readonly logger = new Logger(CandlesService.name);
  private readonly BATCH_SIZE = 1000;

  constructor(
    @InjectRepository(Candle)
    private readonly candleRepository: Repository<Candle>,
    @InjectRepository(CoinExchange)
    private readonly coinExchangeRepository: Repository<CoinExchange>,
    private readonly ccxtService: CCXTService,
  ) {}

  async fetchAndUpdateAllCandles(): Promise<ProcessingResponse> {
    try {
      // Get all active coin-exchange pairs with status 1
      const activePairs = await this.coinExchangeRepository.find({
        where: {
          isActive: true,
          status: 1
        },
        relations: ['coin', 'exchange', 'timeframe']
      });

      this.logger.log(`Found ${activePairs.length} active pairs to process`);
      console.log(`Found ${activePairs.length} active pairs to process`);
      const results: ProcessingResult = {
        processed: 0,
        errors: 0,
        details: []
      };

      for (const pair of activePairs) {
        console.log(`Processing pair: ${pair.coin.symbol}/${pair.exchange.name}`);
        try {
          // Check if candles exist for this pair
          const existingCandles = await this.candleRepository.find({
            where: { coin_exchange_id: pair.id },
            order: { timestamp: 'DESC' },
            take: 1
          });

          if (existingCandles.length > 0) {
            // Update mode - get latest and earliest candles
            console.log(`Updating candles for pair: ${pair.coin.symbol}/${pair.exchange.name}`);
            const latestTimestamp = existingCandles[0].timestamp;
            const earliestCandle = await this.candleRepository.findOne({
              where: { coin_exchange_id: pair.id },
              order: { timestamp: 'ASC' }
            });

            // Update forward from latest timestamp
            await this.updateCandlesForward(pair, latestTimestamp);
            
            // Update backward from earliest timestamp
            if (earliestCandle) {
              await this.updateCandlesBackward(pair, earliestCandle.timestamp);
            }
          } else {
            // Initial fetch - get last 1000 candles
            console.log(`Fetching initial candles for pair: ${pair.coin.symbol}/${pair.exchange.name}`);
            await this.fetchInitialCandles(pair);
          }

          results.processed++;
          results.details.push({
            coin: pair.coin.symbol,
            exchange: pair.exchange.name,
            timeframe: pair.timeframe.interval,
            status: 'success'
          });
        } catch (error) {
          results.errors++;
          results.details.push({
            coin: pair.coin.symbol,
            exchange: pair.exchange.name,
            timeframe: pair.timeframe.interval,
            status: 'error',
            error: error.message
          });
          this.logger.error(`Error processing pair ${pair.coin.symbol}/${pair.exchange.name}: ${error.message}`);
          console.error(`Error processing pair ${pair.coin.symbol}/${pair.exchange.name}: ${error.message}`);
        }
      }

      return {
        message: `Processed ${results.processed} pairs with ${results.errors} errors`,
        details: results
      };
    } catch (error) {
      this.logger.error(`Failed to fetch and update candles: ${error.message}`);
      console.error(`Failed to fetch and update candles: ${error.message}`);
      throw error;
    }
  }

  private async updateCandlesForward(pair: CoinExchange, fromTimestamp: Date): Promise<void> {
    console.log(`Updating candles forward for: ${pair.coin.symbol}/${pair.exchange.name} from ${fromTimestamp}`);
    let currentTimestamp = fromTimestamp;
    let hasMore = true;
    const batchSize = this.BATCH_SIZE;

    while (hasMore) {
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        currentTimestamp.getTime(),
        batchSize
      );

      if (!candles || candles.length === 0) {
        hasMore = false;
        console.log(`No more candles found for: ${pair.coin.symbol}/${pair.exchange.name} forward`);
        continue;
      }

      await this.saveCandleBatch(candles, pair.id);
      
      if (candles.length < batchSize) {
        hasMore = false;
        console.log(`Reached end of candles for: ${pair.coin.symbol}/${pair.exchange.name} forward`);
      } else {
        currentTimestamp = new Date(candles[candles.length - 1].timestamp);
        console.log(`currentTimestamp: ${currentTimestamp.toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async updateCandlesBackward(pair: CoinExchange, fromTimestamp: Date): Promise<void> {
    console.log(`Updating candles backward for: ${pair.coin.symbol}/${pair.exchange.name} from ${fromTimestamp}`);
    let currentTimestamp = fromTimestamp;
    let hasMore = true;
    const batchSize = this.BATCH_SIZE;

    while (hasMore) {
      const since = new Date(currentTimestamp.getTime() - (batchSize * pair.timeframe.minutes * 60 * 1000));
      console.log(`Fetching since: ${since.toISOString()}`);
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        since.getTime(),
        batchSize
      );

      if (!candles || candles.length === 0) {
        hasMore = false;
        console.log(`No more candles found for: ${pair.coin.symbol}/${pair.exchange.name} backward`);
        continue;
      }

      await this.saveCandleBatch(candles, pair.id);
      
      if (candles.length < batchSize) {
        hasMore = false;
        console.log(`Reached end of candles for: ${pair.coin.symbol}/${pair.exchange.name} backward`);
      } else {
        currentTimestamp = new Date(candles[0].timestamp);
        console.log(`currentTimestamp: ${new Date(currentTimestamp).toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async fetchInitialCandles(pair: CoinExchange): Promise<void> {
    console.log(`Fetching initial candles for: ${pair.coin.symbol}/${pair.exchange.name}`);
    let hasMore = true;
    let currentTimestamp = Date.now();
    const batchSize = this.BATCH_SIZE;

    while (hasMore) {
      const since = new Date(currentTimestamp - (batchSize * pair.timeframe.minutes * 60 * 1000));
      console.log(`Fetching since: ${since.toISOString()}`);
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        since.getTime(),
        batchSize
      );

      if (!candles || candles.length === 0) {
        hasMore = false;
        console.log(`No more initial candles found for: ${pair.coin.symbol}/${pair.exchange.name}`);
        continue;
      }

      await this.saveCandleBatch(candles, pair.id);
      
      if (candles.length < batchSize) {
        hasMore = false;
        console.log(`Reached end of initial candles for: ${pair.coin.symbol}/${pair.exchange.name}`);
      } else {
        currentTimestamp = candles[0].timestamp;
        console.log(`currentTimestamp: ${new Date(currentTimestamp).toISOString()}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  private async saveCandleBatch(candles: any[], coinExchangeId: string): Promise<void> {
    console.log(`Saving candle batch for coinExchangeId: ${coinExchangeId}`);
    const coinExchange = await this.coinExchangeRepository.findOne({
      where: { id: coinExchangeId },
      relations: ['timeframe']
    });

    if (!coinExchange) {
      throw new Error(`CoinExchange with id ${coinExchangeId} not found`);
    }

    // Get all existing candles for this time range
    const timestamps = candles.map(candle => new Date(candle.timestamp));
    const existingCandles = await this.candleRepository.find({
      where: {
        coin_exchange_id: coinExchangeId,
        timestamp: In(timestamps)
      }
    });

    // Create a map of existing candles by timestamp
    const existingCandlesMap = new Map(
      existingCandles.map(candle => [candle.timestamp.getTime(), candle])
    );

    // Prepare candles for batch upsert
    const candlesToUpsert = candles.map(candle => {
      const timestamp = new Date(candle.timestamp);
      const existing = existingCandlesMap.get(timestamp.getTime());

      if (existing) {
        // Update existing candle
        return this.candleRepository.create({
          id: existing.id,
          coin_exchange_id: coinExchangeId,
          interval: coinExchange.timeframe.interval,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
          timestamp: timestamp
        });
      } else {
        // Create new candle
        return this.candleRepository.create({
          coin_exchange_id: coinExchangeId,
          interval: coinExchange.timeframe.interval,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
          timestamp: timestamp
        });
      }
    });

    // Save all candles in a single transaction
    await this.candleRepository.save(candlesToUpsert);
    console.log(`Saved ${candlesToUpsert.length} candles (${existingCandles.length} updated, ${candlesToUpsert.length - existingCandles.length} created) for coinExchangeId: ${coinExchangeId}`);
  }

  async fetchRecentCandles(): Promise<ProcessingResponse> {
    try {
      // Get all active coin-exchange pairs with status 2
      const activePairs = await this.coinExchangeRepository.find({
        where: {
          isActive: true,
          status: 2
        },
        relations: ['coin', 'exchange', 'timeframe']
      });

      this.logger.log(`Found ${activePairs.length} active pairs with status 2 to process`);
      const results: ProcessingResult = {
        processed: 0,
        errors: 0,
        details: []
      };

      // Process all pairs concurrently
      const processPromises = activePairs.map(async (pair) => {
        try {
          const candles = await this.ccxtService.fetchCandlesFromCCXT(
            pair.coin.symbol,
            pair.exchange.name,
            pair.timeframe.interval,
            Date.now() - (this.BATCH_SIZE * pair.timeframe.minutes * 60 * 1000), // Get last BATCH_SIZE candles
            this.BATCH_SIZE
          );

          if (candles && candles.length > 0) {
            await this.saveCandleBatch(candles, pair.id);
            return {
              success: true,
              pair,
              error: null
            };
          }
          return {
            success: false,
            pair,
            error: 'No candles returned'
          };
        } catch (error) {
          return {
            success: false,
            pair,
            error: error.message
          };
        }
      });

      // Wait for all promises to resolve
      const processResults = await Promise.all(processPromises);

      // Aggregate results
      processResults.forEach(result => {
        if (result.success) {
          results.processed++;
          results.details.push({
            coin: result.pair.coin.symbol,
            exchange: result.pair.exchange.name,
            timeframe: result.pair.timeframe.interval,
            status: 'success'
          });
        } else {
          results.errors++;
          results.details.push({
            coin: result.pair.coin.symbol,
            exchange: result.pair.exchange.name,
            timeframe: result.pair.timeframe.interval,
            status: 'error',
            error: result.error
          });
        }
      });

      return {
        message: `Processed ${results.processed} pairs with ${results.errors} errors`,
        details: results
      };
    } catch (error) {
      this.logger.error(`Failed to fetch recent candles: ${error.message}`);
      throw error;
    }
  }
}