import { Controller, Get, Query, HttpException, HttpStatus, Logger, Post, HttpCode } from '@nestjs/common';
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
} 