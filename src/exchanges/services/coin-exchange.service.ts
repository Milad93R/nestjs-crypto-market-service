import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoinExchange, MarketType } from '../entities/coin-exchange.entity';
import { Coin } from '../../coins/entities/coin.entity';
import { Exchange } from '../entities/exchange.entity';
import { TimeFrame } from '../entities/timeframe.entity';

interface AddCoinExchangeDto {
  coinId: string;
  exchangeId: string;
  timeframeId: string;
  marketType?: MarketType;
  isActive?: boolean;
  status?: number;
}

@Injectable()
export class CoinExchangeService {
  private readonly logger = new Logger(CoinExchangeService.name);

  constructor(
    @InjectRepository(CoinExchange)
    private readonly coinExchangeRepository: Repository<CoinExchange>,
    @InjectRepository(Coin)
    private readonly coinRepository: Repository<Coin>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(TimeFrame)
    private readonly timeframeRepository: Repository<TimeFrame>,
  ) {}

  async addCoinExchange(dto: AddCoinExchangeDto): Promise<CoinExchange> {
    try {
      // Verify that coin exists
      const coin = await this.coinRepository.findOne({
        where: { id: dto.coinId }
      });
      if (!coin) {
        throw new NotFoundException(`Coin with ID ${dto.coinId} not found`);
      }

      // Verify that exchange exists
      const exchange = await this.exchangeRepository.findOne({
        where: { id: dto.exchangeId }
      });
      if (!exchange) {
        throw new NotFoundException(`Exchange with ID ${dto.exchangeId} not found`);
      }

      // Verify that timeframe exists
      const timeframe = await this.timeframeRepository.findOne({
        where: { id: dto.timeframeId }
      });
      if (!timeframe) {
        throw new NotFoundException(`Timeframe with ID ${dto.timeframeId} not found`);
      }

      // Check if mapping already exists
      const existingMapping = await this.coinExchangeRepository.findOne({
        where: {
          coin: { id: dto.coinId },
          exchange: { id: dto.exchangeId },
          timeframe: { id: dto.timeframeId },
          marketType: dto.marketType || MarketType.SPOT
        }
      });

      if (existingMapping) {
        // Update existing mapping
        Object.assign(existingMapping, {
          isActive: dto.isActive ?? existingMapping.isActive,
          status: dto.status ?? existingMapping.status,
          marketType: dto.marketType ?? existingMapping.marketType
        });

        return this.coinExchangeRepository.save(existingMapping);
      }

      // Create new mapping
      const newCoinExchange = this.coinExchangeRepository.create({
        coin,
        exchange,
        timeframe,
        marketType: dto.marketType || MarketType.SPOT,
        isActive: dto.isActive ?? true,
        status: dto.status ?? 1
      });

      return this.coinExchangeRepository.save(newCoinExchange);
    } catch (error) {
      this.logger.error(`Failed to add coin exchange: ${error.message}`);
      throw error;
    }
  }
} 