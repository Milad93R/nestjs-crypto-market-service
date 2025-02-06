import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CoinExchangeService } from '../services/coin-exchange.service';
import { MarketType } from '../entities/coin-exchange.entity';

interface AddCoinExchangeDto {
  coinId: string;
  exchangeId: string;
  timeframeId: string;
  marketType?: MarketType;
  isActive?: boolean;
  status?: number;
}

@Controller('coin-exchanges')
export class CoinExchangesController {
  private readonly logger = new Logger(CoinExchangesController.name);

  constructor(private readonly coinExchangeService: CoinExchangeService) {}

  @Post()
  async addCoinExchange(@Body() dto: AddCoinExchangeDto) {
    try {
      const coinExchange = await this.coinExchangeService.addCoinExchange(dto);
      return {
        message: 'Coin exchange mapping added successfully',
        data: coinExchange
      };
    } catch (error) {
      this.logger.error(`Failed to add coin exchange: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to add coin exchange',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 