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

  async createAllMappings(): Promise<{ 
    total: number;
    created: number;
    skipped: number;
    errors: number;
  }> {
    try {
      this.logger.log('Starting createAllMappings operation...');

      // Get all coins, exchanges, and timeframes
      this.logger.log('Fetching coins, exchanges, and timeframes...');
      const [coins, exchanges, timeframes] = await Promise.all([
        this.coinRepository.find(),
        this.exchangeRepository.find(),
        this.timeframeRepository.find()
      ]);

      this.logger.log(`Found ${coins.length} coins, ${exchanges.length} exchanges, and ${timeframes.length} timeframes`);
      this.logger.debug('Coins:', coins.map(c => c.symbol));
      this.logger.debug('Exchanges:', exchanges.map(e => e.name));
      this.logger.debug('Timeframes:', timeframes.map(t => t.interval));

      let created = 0;
      let skipped = 0;
      let errors = 0;
      const total = coins.length * exchanges.length * timeframes.length;

      this.logger.log(`Total possible combinations: ${total}`);

      // Create mappings for all combinations
      for (const coin of coins) {
        for (const exchange of exchanges) {
          for (const timeframe of timeframes) {
            try {
              this.logger.debug(
                `Processing combination: Coin=${coin.symbol}, Exchange=${exchange.name}, Timeframe=${timeframe.interval}`
              );

              // Check if mapping already exists
              const existingMapping = await this.coinExchangeRepository.findOne({
                where: {
                  coin: { id: coin.id },
                  exchange: { id: exchange.id },
                  timeframe: { id: timeframe.id },
                  marketType: MarketType.SPOT
                }
              });

              if (existingMapping) {
                this.logger.debug(
                  `Mapping already exists for ${coin.symbol} on ${exchange.name} with timeframe ${timeframe.interval}`
                );
                skipped++;
                continue;
              }

              // Create new mapping
              const newCoinExchange = this.coinExchangeRepository.create({
                coin,
                exchange,
                timeframe,
                marketType: MarketType.SPOT,
                isActive: true,
                status: 1
              });

              await this.coinExchangeRepository.save(newCoinExchange);
              created++;

              this.logger.debug(
                `Created mapping for ${coin.symbol} on ${exchange.name} with timeframe ${timeframe.interval}`
              );
            } catch (error) {
              errors++;
              this.logger.error(
                `Failed to create mapping for ${coin.symbol} on ${exchange.name} with timeframe ${timeframe.interval}:`,
                error.stack
              );
              this.logger.error('Error details:', error);
            }
          }
        }
      }

      const summary = { total, created, skipped, errors };
      this.logger.log(`Operation completed. Summary: ${JSON.stringify(summary)}`);
      return summary;
    } catch (error) {
      this.logger.error(`Failed to create all mappings: ${error.message}`, error.stack);
      this.logger.error('Error details:', error);
      throw error;
    }
  }
} 