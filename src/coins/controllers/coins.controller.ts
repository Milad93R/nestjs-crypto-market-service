import { Controller, Post, Get, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { CoinService } from '../services/coin.service';
import { Coin } from '../entities/coin.entity';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddCoinDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name cannot be empty' })
  name: string;

  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @MinLength(1, { message: 'Symbol cannot be empty' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Symbol must be uppercase letters and numbers only' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  symbol: string;
}

@Controller('coins')
export class CoinsController {
  constructor(private readonly coinService: CoinService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async addCoin(@Body() dto: AddCoinDto): Promise<Coin> {
    return this.coinService.addCoin(dto);
  }

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