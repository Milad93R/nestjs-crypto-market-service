import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position, PositionStatus, PositionType, StopLossReason } from '../entities/position.entity';

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {}

  async createPosition(data: {
    coinExchangeId: number;
    type: PositionType;
    entryPrice: number;
    quantity: number;
    stopLoss?: number;
    takeProfit?: number;
  }): Promise<Position> {
    const position = this.positionRepository.create({
      coinExchangeId: data.coinExchangeId,
      type: data.type,
      entryPrice: data.entryPrice,
      quantity: data.quantity,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      status: PositionStatus.OPEN,
    });

    return this.positionRepository.save(position);
  }

  async closePosition(
    id: number, 
    exitPrice: number, 
    stopLossReason?: StopLossReason,
    stopLossDetails?: string
  ): Promise<Position> {
    const position = await this.positionRepository.findOne({ where: { id } });
    
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    if (position.status === PositionStatus.CLOSED) {
      this.logger.warn(`Position ${id} is already closed`);
      return position;
    }

    position.status = PositionStatus.CLOSED;
    position.exitPrice = exitPrice;
    position.closedAt = new Date();
    
    // Set stop loss reason if provided
    if (stopLossReason) {
      position.stopLossReason = stopLossReason;
      position.stopLossDetails = stopLossDetails || null;
    }

    return this.positionRepository.save(position);
  }

  async getOpenPositions(): Promise<Position[]> {
    return this.positionRepository.find({
      where: { status: PositionStatus.OPEN },
      relations: ['coinExchange', 'coinExchange.coin', 'coinExchange.exchange', 'coinExchange.timeframe'],
    });
  }

  async getPositionById(id: number): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['coinExchange', 'coinExchange.coin', 'coinExchange.exchange', 'coinExchange.timeframe'],
    });

    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    return position;
  }

  async getPositionsByStopLossReason(reason: StopLossReason): Promise<Position[]> {
    return this.positionRepository.find({
      where: { stopLossReason: reason },
      relations: ['coinExchange', 'coinExchange.coin', 'coinExchange.exchange', 'coinExchange.timeframe'],
    });
  }

  async updateStopLoss(
    id: number, 
    stopLoss: number, 
    reason?: StopLossReason,
    details?: string
  ): Promise<Position> {
    const position = await this.positionRepository.findOne({ where: { id } });
    
    if (!position) {
      throw new NotFoundException(`Position with ID ${id} not found`);
    }

    position.stopLoss = stopLoss;
    
    if (reason) {
      position.stopLossReason = reason;
      position.stopLossDetails = details || null;
    }

    return this.positionRepository.save(position);
  }
} 