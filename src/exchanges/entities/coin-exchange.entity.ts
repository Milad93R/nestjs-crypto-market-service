import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, JoinColumn, Index } from 'typeorm';
import { Coin } from '../../coins/entities/coin.entity';
import { Exchange } from './exchange.entity';
import { TimeFrame } from './timeframe.entity';

export enum MarketType {
  SPOT = 'spot',
  PERPETUAL = 'perpetual'
}

@Entity('coin_exchanges')
@Index(['coin', 'exchange', 'timeframe', 'marketType'], { unique: true })
export class CoinExchange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Coin, coin => coin.coinExchanges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coin_id' })
  coin: Coin;

  @ManyToOne(() => Exchange, exchange => exchange.coinExchanges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;

  @ManyToOne(() => TimeFrame, timeframe => timeframe.coinExchanges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'timeframe_id' })
  timeframe: TimeFrame;

  @Column({
    type: 'enum',
    enum: MarketType,
    default: MarketType.SPOT
  })
  marketType: MarketType;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 1 })
  status: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 