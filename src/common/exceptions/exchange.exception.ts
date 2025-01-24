import { HttpException, HttpStatus } from '@nestjs/common';

export class ExchangeException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}

export class ExchangeConnectionException extends ExchangeException {
  constructor(exchange: string) {
    super(`Failed to connect to exchange: ${exchange}`);
  }
}

export class ExchangeRateLimitException extends ExchangeException {
  constructor(exchange: string) {
    super(`Rate limit exceeded for exchange: ${exchange}`);
  }
} 