import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coin } from '../entities/coin.entity';
import { CoinGeckoService } from './coingecko.service';

@Injectable()
export class CoinService {
  private readonly logger = new Logger(CoinService.name);

  constructor(
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    private readonly coinGeckoService: CoinGeckoService,
  ) {}

  async updateCoins(): Promise<void> {
    try {
      const coins = await this.coinGeckoService.fetchTopCoins();
      let newCoinsCount = 0;
      
      for (const coinData of coins) {
        const symbol = coinData.symbol.toUpperCase();
        
        // Check if coin with this symbol already exists
        const existingCoin = await this.coinRepository.findOne({
          where: { symbol }
        });

        if (!existingCoin) {
          // Only create new coin if it doesn't exist
          const newCoin = this.coinRepository.create({
            name: coinData.name,
            symbol: symbol,
          });
          await this.coinRepository.save(newCoin);
          newCoinsCount++;
        }
      }

      this.logger.log(`Successfully added ${newCoinsCount} new coins`);
    } catch (error) {
      this.logger.error(`Error updating coins: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(): Promise<Coin[]> {
    return this.coinRepository.find();
  }

  async findBySymbol(symbol: string): Promise<Coin | null> {
    return this.coinRepository.findOne({
      where: { symbol: symbol.toUpperCase() }
    });
  }
} 