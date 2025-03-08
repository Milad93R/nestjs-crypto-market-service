import { Body, Controller, Get, Param, Post, Put, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { PositionService } from '../services/position.service';
import { Position, PositionType, StopLossReason } from '../entities/position.entity';

class CreatePositionDto {
  coinExchangeId: number;
  type: PositionType;
  entryPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
}

class ClosePositionDto {
  exitPrice: number;
  stopLossReason?: StopLossReason;
  stopLossDetails?: string;
}

class UpdateStopLossDto {
  stopLoss: number;
  reason?: StopLossReason;
  details?: string;
}

@ApiTags('positions')
@Controller('positions')
export class PositionController {
  private readonly logger = new Logger(PositionController.name);

  constructor(private readonly positionService: PositionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ type: CreatePositionDto })
  async createPosition(@Body() createPositionDto: CreatePositionDto): Promise<Position> {
    try {
      this.logger.log(`Creating position for coin exchange ID: ${createPositionDto.coinExchangeId}`);
      return await this.positionService.createPosition(createPositionDto);
    } catch (error) {
      this.logger.error(`Failed to create position: ${error.message}`);
      throw new HttpException(`Failed to create position: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id/close')
  @ApiOperation({ summary: 'Close an existing position' })
  @ApiResponse({ status: 200, description: 'Position closed successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: ClosePositionDto })
  async closePosition(
    @Param('id') id: number,
    @Body() closePositionDto: ClosePositionDto
  ): Promise<Position> {
    try {
      this.logger.log(`Closing position ID: ${id}`);
      return await this.positionService.closePosition(
        id,
        closePositionDto.exitPrice,
        closePositionDto.stopLossReason,
        closePositionDto.stopLossDetails
      );
    } catch (error) {
      this.logger.error(`Failed to close position: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all open positions' })
  @ApiResponse({ status: 200, description: 'Returns all open positions' })
  async getOpenPositions(): Promise<Position[]> {
    try {
      return await this.positionService.getOpenPositions();
    } catch (error) {
      this.logger.error(`Failed to get open positions: ${error.message}`);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiResponse({ status: 200, description: 'Returns the position' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  async getPositionById(@Param('id') id: number): Promise<Position> {
    try {
      return await this.positionService.getPositionById(id);
    } catch (error) {
      this.logger.error(`Failed to get position: ${error.message}`);
      throw error;
    }
  }

  @Get('stoploss-reason/:reason')
  @ApiOperation({ summary: 'Get positions by stoploss reason' })
  @ApiResponse({ status: 200, description: 'Returns positions with the specified stoploss reason' })
  @ApiParam({ name: 'reason', description: 'StopLoss reason', enum: StopLossReason })
  async getPositionsByStopLossReason(@Param('reason') reason: StopLossReason): Promise<Position[]> {
    try {
      return await this.positionService.getPositionsByStopLossReason(reason);
    } catch (error) {
      this.logger.error(`Failed to get positions by stoploss reason: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/stoploss')
  @ApiOperation({ summary: 'Update position stoploss' })
  @ApiResponse({ status: 200, description: 'Stoploss updated successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  @ApiParam({ name: 'id', description: 'Position ID' })
  @ApiBody({ type: UpdateStopLossDto })
  async updateStopLoss(
    @Param('id') id: number,
    @Body() updateStopLossDto: UpdateStopLossDto
  ): Promise<Position> {
    try {
      this.logger.log(`Updating stoploss for position ID: ${id}`);
      return await this.positionService.updateStopLoss(
        id,
        updateStopLossDto.stopLoss,
        updateStopLossDto.reason,
        updateStopLossDto.details
      );
    } catch (error) {
      this.logger.error(`Failed to update stoploss: ${error.message}`);
      throw error;
    }
  }
} 