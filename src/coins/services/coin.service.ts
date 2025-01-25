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
      
      for (const coinData of coins) {
        const existingCoin = await this.coinRepository.findOne({
          where: [
            { symbol: coinData.symbol.toUpperCase() },
            { name: coinData.name }
          ]
        });

        if (existingCoin) {
          // Update existing coin
          existingCoin.name = coinData.name;
          existingCoin.symbol = coinData.symbol.toUpperCase();
          await this.coinRepository.save(existingCoin);
        } else {
          // Create new coin
          const newCoin = this.coinRepository.create({
            name: coinData.name,
            symbol: coinData.symbol.toUpperCase(),
          });
          await this.coinRepository.save(newCoin);
        }
      }

      this.logger.log(`Successfully updated ${coins.length} coins`);
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