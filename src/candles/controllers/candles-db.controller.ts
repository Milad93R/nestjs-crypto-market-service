import { Controller, Get, Param, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CCXTService } from '../../exchanges/services/ccxt.service';

@Controller('candles/db')
export class CandlesDBController {
  private readonly logger = new Logger(CandlesDBController.name);

  constructor(private readonly ccxtService: CCXTService) {}

  @Get(':symbol/:exchange')
  async getCandles(
    @Param('symbol') symbol: string,
    @Param('exchange') exchange: string,
    @Query('timeframe') timeframe: string = '1h',
    @Query('startTime') startTime?: number,
    @Query('endTime') endTime?: number,
    @Query('limit') limit: number = 100,
    @Query('page') page: number = 1,
  ) {
    try {
      if (!symbol || !exchange) {
        throw new HttpException(
          'Symbol and exchange are required parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validate timeframe
      const validTimeframes = ['1h', '4h', '1d'];
      if (!validTimeframes.includes(timeframe)) {
        throw new HttpException(
          `Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const { candles, total } = await this.ccxtService.getCandles(
        symbol,
        exchange,
        timeframe,
        startTime,
        endTime,
        limit,
        page,
      );

      return {
        symbol,
        exchange,
        timeframe,
        total,
        page,
        limit,
        candles: candles.map(candle => ({
          timestamp: candle.timestamp,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume
        }))
      };
    } catch (error) {
      this.logger.error(`Error fetching candles from DB: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch candles from database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 