import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan, In } from 'typeorm';
import { Candle } from '../entities/candle.entity';
import { CoinExchange } from '../../exchanges/entities/coin-exchange.entity';
import { CCXTService } from '../../exchanges/services/ccxt.service';
import { ProcessingResult, ProcessingResponse } from '../types/processing-result.type';
import { NoActivePairsException } from '../exceptions/no-active-pairs.exception';

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
      console.log('Fetching all active pairs');
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
            console.log(`Updating candles forward for pair: ${pair.coin.symbol}/${pair.exchange.name} from ${latestTimestamp}`);
            await this.updateCandlesForward(pair, latestTimestamp);
            
            // Update backward from earliest timestamp
            if (earliestCandle) {
              console.log(`Updating candles backward for pair: ${pair.coin.symbol}/${pair.exchange.name} from ${earliestCandle.timestamp}`);
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
      console.log(`1111111111111111`);
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        currentTimestamp.getTime(),
        batchSize
      );
      console.log(`candles length: ${candles.length}`);
      console.log(`batchSize: ${batchSize}`);
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
    console.log(`[START] Updating candles backward for: ${pair.coin.symbol}/${pair.exchange.name} from ${fromTimestamp}`);
    let currentTimestamp = fromTimestamp;
    let hasMore = true;
    const batchSize = this.BATCH_SIZE;
    let iteration = 0;

    while (hasMore) {
      iteration++;
      console.log(`[ITERATION ${iteration}] Starting new backward fetch iteration`);
      console.log(`[ITERATION ${iteration}] Current timestamp: ${currentTimestamp}`);
      
      const since = new Date(currentTimestamp.getTime() - (batchSize * pair.timeframe.minutes * 60 * 1000));
      console.log(`[ITERATION ${iteration}] Calculated since: ${since.toISOString()}`);
      
      console.log(`[ITERATION ${iteration}] Fetching candles...`);
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        since.getTime(),
        batchSize
      );
      
      console.log(`[ITERATION ${iteration}] Received ${candles?.length || 0} candles`);

      if (!candles || candles.length === 0) {
        console.log(`[ITERATION ${iteration}] No candles received, ending loop`);
        hasMore = false;
        continue;
      }

      console.log(`[ITERATION ${iteration}] Saving candles...`);
      await this.saveCandleBatch(candles, pair.id);
      console.log(`[ITERATION ${iteration}] Candles saved`);

      if (candles.length < batchSize) {
        console.log(`[ITERATION ${iteration}] Received less than ${batchSize} candles, ending loop`);
        hasMore = false;
      } else {
        const oldTimestamp = currentTimestamp;
        currentTimestamp = new Date(candles[0].timestamp);
        console.log(`[ITERATION ${iteration}] Updated timestamp from ${oldTimestamp} to ${currentTimestamp}`);
        
        if (currentTimestamp >= oldTimestamp) {
          console.log(`[ITERATION ${iteration}] WARNING: New timestamp is not older than previous timestamp!`);
          hasMore = false;
        } else {
          console.log(`[ITERATION ${iteration}] Waiting before next iteration...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    console.log(`[END] Finished updating candles backward for: ${pair.coin.symbol}/${pair.exchange.name}`);
  }

  private async fetchInitialCandles(pair: CoinExchange): Promise<void> {
    console.log(`Fetching initial candles for: ${pair.coin.symbol}/${pair.exchange.name}`);
    let hasMore = true;
    let currentTimestamp = Date.now();
    const batchSize = this.BATCH_SIZE;

    while (hasMore) {
      console.log(`3333333333333333`);
      const since = new Date(currentTimestamp - (batchSize * pair.timeframe.minutes * 60 * 1000));
      console.log(`Fetching since: ${since.toISOString()}`);
      const candles = await this.ccxtService.fetchCandlesFromCCXT(
        pair.coin.symbol,
        pair.exchange.name,
        pair.timeframe.interval,
        since.getTime(),
        batchSize
      );
      console.log(`candles length: ${candles.length}`);
      if (candles.length > 0) {
        console.log('First candle:', candles[0]);
        console.log('First candle timestamp:', new Date(candles[0].timestamp).toISOString());
        console.log('Last candle:', candles[candles.length - 1]);
        console.log('Last candle timestamp:', new Date(candles[candles.length - 1].timestamp).toISOString());
      }
      
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
        if (candles[0].timestamp === currentTimestamp) {
          console.log(`candles[0].timestamp === currentTimestamp`);
          hasMore = false;
          console.log(`last batch candles are in the same timestamp as currentTimestamp`);
        } else {
          console.log(`candles[0].timestamp !== currentTimestamp`);
        }
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

  async getCandlesByExchangeAndTimeframe(
    exchange: string, 
    timeframe: string,
    startTime?: Date,
    endTime?: Date,
    symbols?: string[]
  ): Promise<any> {
    try {
      // Get all active coin-exchange pairs for this exchange and timeframe
      const queryBuilder = this.coinExchangeRepository
        .createQueryBuilder('coinExchange')
        .leftJoinAndSelect('coinExchange.coin', 'coin')
        .leftJoinAndSelect('coinExchange.exchange', 'exchange')
        .leftJoinAndSelect('coinExchange.timeframe', 'timeframe')
        .where('coinExchange.isActive = :isActive', { isActive: true })
        .andWhere('exchange.name = :exchange', { exchange })
        .andWhere('timeframe.interval = :timeframe', { timeframe });

      // Add symbols filter if provided
      if (symbols && symbols.length > 0) {
        queryBuilder.andWhere('coin.symbol IN (:...symbols)', { symbols });
      }

      const pairs = await queryBuilder.getMany();

      if (!pairs.length) {
        throw new NoActivePairsException(exchange, timeframe, symbols);
      }

      // Get all candles for each pair with time range filter if provided
      const results = await Promise.all(
        pairs.map(async (pair) => {
          const candleQueryBuilder = this.candleRepository
            .createQueryBuilder('candle')
            .where('candle.coin_exchange_id = :coinExchangeId', { coinExchangeId: pair.id });

          if (startTime) {
            candleQueryBuilder.andWhere('candle.timestamp >= :startTime', { startTime });
          }

          if (endTime) {
            candleQueryBuilder.andWhere('candle.timestamp <= :endTime', { endTime });
          }

          const candles = await candleQueryBuilder
            .orderBy('candle.timestamp', 'DESC')
            .getMany();

          return {
            symbol: pair.coin.symbol,
            candles: candles.map(candle => ({
              open: candle.open.toString(),
              high: candle.high.toString(),
              low: candle.low.toString(),
              close: candle.close.toString(),
              volume: candle.volume.toString(),
              timestamp: candle.timestamp
            }))
          };
        })
      );

      // Filter out symbols with no candles and restructure the response
      const symbolsWithCandles = results.filter(result => result.candles.length > 0);
      const allCandles = symbolsWithCandles.flatMap(result => 
        result.candles.map(candle => ({
          symbol: result.symbol,
          ...candle
        }))
      ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return {
        exchange,
        timeframe,
        symbols: symbols || 'all',
        availableSymbols: symbolsWithCandles.map(result => result.symbol),
        total: allCandles.length,
        data: allCandles
      };
    } catch (error) {
      if (error instanceof NoActivePairsException) {
        throw error;
      }
      this.logger.error(`Failed to get candles by exchange and timeframe: ${error.message}`);
      throw error;
    }
  }
}