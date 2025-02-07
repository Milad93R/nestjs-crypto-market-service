import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Coin } from '../../coins/entities/coin.entity';
import { Exchange } from './exchange.entity';
import { TimeFrame } from './timeframe.entity';

export enum MarketType {
  SPOT = 'spot',
  FUTURES = 'futures',
  MARGIN = 'margin'
}

@Entity('coin_exchanges')
export class CoinExchange {
  @ApiProperty({
    description: 'The unique identifier of the coin-exchange mapping',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The associated coin',
    type: () => Coin
  })
  @ManyToOne(() => Coin, coin => coin.exchanges, { onDelete: 'CASCADE' })
  coin: Coin;

  @ApiProperty({
    description: 'The associated exchange',
    type: () => Exchange
  })
  @ManyToOne(() => Exchange, exchange => exchange.coinExchanges, { onDelete: 'CASCADE' })
  exchange: Exchange;

  @ApiProperty({
    description: 'The associated timeframe',
    type: () => TimeFrame
  })
  @ManyToOne(() => TimeFrame, { onDelete: 'CASCADE' })
  timeframe: TimeFrame;

  @ApiProperty({
    description: 'The type of market',
    enum: MarketType,
    default: MarketType.SPOT
  })
  @Column({
    type: 'enum',
    enum: MarketType,
    default: MarketType.SPOT
  })
  marketType: MarketType;

  @ApiProperty({
    description: 'Whether the coin-exchange pair is active',
    default: true
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    description: 'The status of the coin-exchange pair',
    default: 1
  })
  @Column({ default: 1 })
  status: number;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2024-02-06T17:48:13.998Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2024-02-06T17:48:13.998Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;
} 