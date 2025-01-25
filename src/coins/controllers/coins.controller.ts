import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { CoinService } from '../services/coin.service';
import { Coin } from '../entities/coin.entity';

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinService: CoinService) {}

  @Post('update')
  @HttpCode(HttpStatus.OK)
  async updateCoins(): Promise<{ message: string }> {
    await this.coinService.updateCoins();
    return { message: 'Coins updated successfully' };
  }

  @Get()
  async findAll(): Promise<Coin[]> {
    return this.coinService.findAll();
  }
} 