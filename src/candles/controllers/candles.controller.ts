import { Controller, Get, Query, HttpException, HttpStatus, Logger, Post, HttpCode, Param } from '@nestjs/common';
import { CCXTService } from '../../exchanges/services/ccxt.service';
import { CandlesService } from '../services/candles.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProcessingResponse } from '../types/processing-result.type';

@ApiTags('candles')
@Controller('candles')
export class CandlesController {
  private readonly logger = new Logger(CandlesController.name);

  constructor(
    private readonly ccxtService: CCXTService,
    private readonly candlesService: CandlesService
  ) {}

  @Get('latest')
  async getLatestCandles(
    @Query('symbol') symbol: string,
    @Query('exchange') exchange: string,
    @Query('timeframe') timeframe: string = '1h',
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

      // Get exchange status for the timeframe
      const status = await this.ccxtService.getExchangeTimeframeStatus(exchange, timeframe);
      if (status === undefined) {
        throw new HttpException(
          `Exchange ${exchange} with timeframe ${timeframe} is not configured`,
          HttpStatus.BAD_REQUEST,
        );
      }

      try {
        // Calculate since timestamp for 1000 candles ago
        const multiplier = this.getTimeframeMultiplier(timeframe);
        const since = Date.now() - (1000 * multiplier * 1000); // Convert to milliseconds

        // Fetch candles directly from CCXT
        const candles = await this.ccxtService.fetchCandlesFromCCXT(symbol, exchange, timeframe, since);

        return {
          symbol,
          exchange,
          timeframe,
          total: candles.length,
          candles
        };
      } catch (ccxtError) {
        this.logger.error(`CCXT Error: ${ccxtError.message}`, ccxtError.stack);
        throw new HttpException(
          `Failed to fetch data from ${exchange}: ${ccxtError.message}`,
          HttpStatus.BAD_GATEWAY
        );
      }
    } catch (error) {
      this.logger.error(`Error fetching latest candles: ${error.message}`, error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch candles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  @Post('fetch-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch and update candles for all active coin-exchange pairs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Candles fetched and updated successfully.',
    type: ProcessingResponse
  })
  @ApiResponse({ status: 500, description: 'Failed to fetch candles.' })
  async fetchAndUpdateAllCandles(): Promise<ProcessingResponse> {
    try {
      this.logger.log('Starting to fetch and update candles for all active pairs');
      const result = await this.candlesService.fetchAndUpdateAllCandles();
      this.logger.log('Completed fetching and updating candles');
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch and update candles: ${error.message}`);
      throw error;
    }
  }

  @Post('fetch-recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch recent candles for all active coin-exchange pairs with status 2' })
  @ApiResponse({ 
    status: 200, 
    description: 'Recent candles fetched and updated successfully.',
    type: ProcessingResponse
  })
  @ApiResponse({ status: 500, description: 'Failed to fetch candles.' })
  async fetchRecentCandles(): Promise<ProcessingResponse> {
    try {
      this.logger.log('Starting to fetch recent candles for active pairs with status 2');
      const result = await this.candlesService.fetchRecentCandles();
      this.logger.log('Completed fetching recent candles');
      return result;
    } catch (error) {
      this.logger.error(`Failed to fetch recent candles: ${error.message}`);
      throw error;
    }
  }

  @Get('exchange/:exchange/timeframe/:timeframe')
  @ApiOperation({ 
    summary: 'Get all candles by exchange and timeframe',
    description: 'Fetches all candles for all symbols on a specific exchange and timeframe'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all candles with symbol information',
    schema: {
      example: {
        exchange: "binance",
        timeframe: "1h",
        total: 1000,
        data: [
          {
            symbol: "BTC",
            open: "50000.00000000",
            high: "51000.00000000",
            low: "49000.00000000",
            close: "50500.00000000",
            volume: "100.00000000",
            timestamp: "2024-02-08T00:00:00.000Z"
          },
          {
            symbol: "ETH",
            open: "2500.00000000",
            high: "2550.00000000",
            low: "2450.00000000",
            close: "2525.00000000",
            volume: "1000.00000000",
            timestamp: "2024-02-08T00:00:00.000Z"
          }
        ]
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid exchange or timeframe' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getCandlesByExchangeAndTimeframe(
    @Param('exchange') exchange: string,
    @Param('timeframe') timeframe: string
  ) {
    try {
      this.logger.log(`Fetching all candles for exchange: ${exchange}, timeframe: ${timeframe}`);
      return await this.candlesService.getCandlesByExchangeAndTimeframe(exchange, timeframe);
    } catch (error) {
      this.logger.error(`Failed to fetch candles: ${error.message}`);
      throw error;
    }
  }
} 