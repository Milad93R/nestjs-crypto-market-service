import { Controller, Post, Get, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { CoinService } from '../services/coin.service';
import { Coin } from '../entities/coin.entity';
import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';

export class AddCoinDto {
  @ApiProperty({
    description: 'The name of the coin',
    example: 'Bitcoin'
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({
    description: 'The symbol of the coin (uppercase letters and numbers only)',
    example: 'BTC'
  })
  @IsString({ message: 'Symbol must be a string' })
  @IsNotEmpty({ message: 'Symbol is required' })
  @MinLength(1, { message: 'Symbol cannot be empty' })
  @Matches(/^[A-Z0-9]+$/, { message: 'Symbol must be uppercase letters and numbers only' })
  @Transform(({ value }) => value?.trim().toUpperCase())
  symbol: string;
}

@ApiTags('coins')
@Controller('coins')
export class CoinsController {
  constructor(private readonly coinService: CoinService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new coin' })
  @ApiResponse({ status: 201, description: 'The coin has been successfully created.', type: Coin })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Coin already exists.' })
  async addCoin(@Body() dto: AddCoinDto): Promise<Coin> {
    return this.coinService.addCoin(dto);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update coins list from CoinGecko' })
  @ApiResponse({ status: 200, description: 'Coins updated successfully.' })
  @ApiResponse({ status: 500, description: 'Failed to update coins.' })
  async updateCoins(): Promise<{ message: string }> {
    await this.coinService.updateCoins();
    return { message: 'Coins updated successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get all coins' })
  @ApiResponse({ status: 200, description: 'Return all coins.', type: [Coin] })
  async findAll(): Promise<Coin[]> {
    return this.coinService.findAll();
  }
} 