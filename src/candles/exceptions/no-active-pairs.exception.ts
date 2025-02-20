import { HttpException, HttpStatus } from '@nestjs/common';

export class NoActivePairsException extends HttpException {
  constructor(exchange: string, timeframe: string, symbols?: string[]) {
    const message = symbols && symbols.length > 0
      ? `No active pairs found for exchange ${exchange} with timeframe ${timeframe} and symbols ${symbols.join(',')}`
      : `No active pairs found for exchange ${exchange} with timeframe ${timeframe}`;
    
    super({
      statusCode: HttpStatus.NOT_FOUND,
      message,
      error: 'Not Found',
      details: {
        exchange,
        timeframe,
        symbols: symbols || 'all'
      }
    }, HttpStatus.NOT_FOUND);
  }
} 