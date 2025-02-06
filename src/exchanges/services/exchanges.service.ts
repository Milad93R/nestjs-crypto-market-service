import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../entities/exchange.entity';

interface AddExchangeDto {
  name: string;  // e.g., "binance", "kucoin", "okx"
}

@Injectable()
export class ExchangesService {
  private readonly logger = new Logger(ExchangesService.name);

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
  ) {}

  async addExchange(dto: AddExchangeDto): Promise<Exchange> {
    try {
      // Check if exchange with same name already exists
      const existing = await this.exchangeRepository.findOne({
        where: { name: dto.name.toLowerCase() }
      });

      if (existing) {
        throw new ConflictException(
          `Exchange with name ${dto.name} already exists`
        );
      }

      // Create new exchange
      const exchange = this.exchangeRepository.create({
        name: dto.name.toLowerCase()
      });

      return this.exchangeRepository.save(exchange);
    } catch (error) {
      this.logger.error(`Failed to add exchange: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<Exchange[]> {
    return this.exchangeRepository.find({
      order: {
        name: 'ASC'
      }
    });
  }
} 