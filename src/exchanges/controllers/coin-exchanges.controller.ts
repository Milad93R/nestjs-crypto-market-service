import { Controller, Post, Body, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { CoinExchangeService } from '../services/coin-exchange.service';
import { MarketType } from '../entities/coin-exchange.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';

export class AddCoinExchangeDto {
  @ApiProperty({
    description: 'The ID of the coin',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  coinId: string;

  @ApiProperty({
    description: 'The ID of the exchange',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  exchangeId: string;

  @ApiProperty({
    description: 'The ID of the timeframe',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  timeframeId: string;

  @ApiProperty({
    description: 'The type of market',
    enum: MarketType,
    default: MarketType.SPOT
  })
  @IsOptional()
  @IsEnum(MarketType)
  marketType?: MarketType;

  @ApiProperty({
    description: 'Whether the mapping is active',
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'The status of the mapping',
    default: 1
  })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class CreateAllMappingsDto {
  @ApiProperty({
    description: 'The type of market for all mappings',
    enum: MarketType,
    default: MarketType.SPOT
  })
  @IsOptional()
  @IsEnum(MarketType)
  marketType?: MarketType;
}

@ApiTags('coin-exchanges')
@Controller('coin-exchanges')
export class CoinExchangesController {
  private readonly logger = new Logger(CoinExchangesController.name);

  constructor(private readonly coinExchangeService: CoinExchangeService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new coin-exchange mapping' })
  @ApiResponse({ 
    status: 201, 
    description: 'The mapping has been successfully created.'
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Coin, exchange, or timeframe not found.' })
  async addCoinExchange(@Body() dto: AddCoinExchangeDto) {
    try {
      this.logger.debug(`Attempting to add coin exchange mapping: ${JSON.stringify(dto)}`);
      const coinExchange = await this.coinExchangeService.addCoinExchange(dto);
      this.logger.debug(`Successfully added coin exchange mapping: ${JSON.stringify(coinExchange)}`);
      return {
        message: 'Coin exchange mapping added successfully',
        data: coinExchange
      };
    } catch (error) {
      this.logger.error(`Failed to add coin exchange: ${error.message}`, error.stack);
      throw new HttpException(
        error.message || 'Failed to add coin exchange',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('create-all')
  @ApiOperation({ summary: 'Create mappings for all combinations of coins, exchanges, and timeframes' })
  @ApiResponse({ 
    status: 201, 
    description: 'The mappings have been created.',
    schema: {
      properties: {
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: {
            total: { type: 'number', description: 'Total number of possible combinations' },
            created: { type: 'number', description: 'Number of new mappings created' },
            skipped: { type: 'number', description: 'Number of existing mappings skipped' },
            errors: { type: 'number', description: 'Number of errors encountered' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createAllMappings(@Body() dto?: CreateAllMappingsDto) {
    this.logger.log('Received request to create all mappings');
    this.logger.debug(`Request body: ${JSON.stringify(dto)}`);
    
    try {
      this.logger.log('Calling coin exchange service to create all mappings...');
      const result = await this.coinExchangeService.createAllMappings();
      
      this.logger.log(`Successfully created mappings. Results: ${JSON.stringify(result)}`);
      return {
        message: 'Coin exchange mappings created successfully',
        data: result
      };
    } catch (error) {
      this.logger.error(`Failed to create all mappings: ${error.message}`, error.stack);
      this.logger.error('Error details:', error);
      throw new HttpException(
        error.message || 'Failed to create all mappings',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 