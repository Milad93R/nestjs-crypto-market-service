import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CoinExchange } from '../../exchanges/entities/coin-exchange.entity';

export enum PositionType {
  LONG = 'long',
  SHORT = 'short'
}

export enum PositionStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export enum StopLossReason {
  PRICE_TARGET = 'price_target',
  TRAILING_STOP = 'trailing_stop',
  TIME_BASED = 'time_based',
  VOLATILITY = 'volatility',
  MANUAL = 'manual',
  TECHNICAL_INDICATOR = 'technical_indicator',
  RISK_MANAGEMENT = 'risk_management',
  OTHER = 'other'
}

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => CoinExchange)
  @JoinColumn({ name: 'coin_exchange_id' })
  coinExchange: CoinExchange;

  @Column({ name: 'coin_exchange_id' })
  coinExchangeId: number;

  @Column({
    type: 'enum',
    enum: PositionType,
    default: PositionType.LONG
  })
  type: PositionType;

  @Column({
    type: 'enum',
    enum: PositionStatus,
    default: PositionStatus.OPEN
  })
  status: PositionStatus;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  entryPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  exitPrice: number;

  @Column({ type: 'decimal', precision: 20, scale: 8 })
  quantity: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  stopLoss: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  takeProfit: number;

  @Column({
    type: 'enum',
    enum: StopLossReason,
    nullable: true,
    name: 'stop_loss_reason'
  })
  stopLossReason: StopLossReason;

  @Column({ type: 'text', nullable: true, name: 'stop_loss_details' })
  stopLossDetails: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
} 