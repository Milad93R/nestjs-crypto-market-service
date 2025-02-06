import { Controller, Post, Body, HttpException, HttpStatus, Logger, Get } from '@nestjs/common';
import { ExchangesService } from '../services/exchanges.service';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class AddExchangeDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(1, { message: 'Name cannot be empty' })
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Name can only contain letters, numbers, underscores and hyphens' })
  @Transform(({ value }) => value?.trim().toLowerCase())
  name: string;
}

@Controller('exchanges')
export class ExchangesController {
  private readonly logger = new Logger(ExchangesController.name);

  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  async addExchange(@Body() dto: AddExchangeDto) {
    try {
      const exchange = await this.exchangesService.addExchange(dto);
      return {
        message: 'Exchange added successfully',
        data: exchange
      };
    } catch (error) {
      this.logger.error(`Failed to add exchange: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        error.message || 'Failed to add exchange',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getAllExchanges() {
    try {
      const exchanges = await this.exchangesService.findAll();
      return {
        data: exchanges
      };
    } catch (error) {
      this.logger.error(`Failed to get exchanges: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get exchanges',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 