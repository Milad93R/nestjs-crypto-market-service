import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exchange } from '../entities/exchange.entity';
import { AddExchangeDto } from '../controllers/exchanges.controller';

@Injectable()
export class ExchangesService {
  private readonly logger = new Logger(ExchangesService.name);

  constructor(
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
  ) {}

  async addExchange(dto: AddExchangeDto): Promise<Exchange> {
    try {
      if (!dto || !dto.name) {
        throw new BadRequestException('Exchange name is required');
      }

      const name = dto.name.toLowerCase().trim();
      
      if (!name) {
        throw new BadRequestException('Exchange name cannot be empty');
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        throw new BadRequestException('Exchange name can only contain letters, numbers, underscores and hyphens');
      }

      // Check if exchange with same name already exists
      const existing = await this.exchangeRepository.findOne({
        where: { name }
      });

      if (existing) {
        throw new ConflictException(
          `Exchange with name ${name} already exists`
        );
      }

      // Create new exchange
      const exchange = this.exchangeRepository.create({
        name
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