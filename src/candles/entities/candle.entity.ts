import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { CoinExchange } from '../../exchanges/entities/coin-exchange.entity';

@Entity('candles')
@Index(['coin_exchange_id', 'timestamp'])
export class Candle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  coin_exchange_id: string;

  @Column({ type: 'varchar', length: 10 })
  interval: string;

  @Column('decimal', { precision: 20, scale: 8 })
  open: number;

  @Column('decimal', { precision: 20, scale: 8 })
  high: number;

  @Column('decimal', { precision: 20, scale: 8 })
  low: number;

  @Column('decimal', { precision: 20, scale: 8 })
  close: number;

  @Column('decimal', { precision: 20, scale: 8 })
  volume: number;

  @Column('timestamp')
  timestamp: Date;

  @ManyToOne(() => CoinExchange)
  @JoinColumn({ name: 'coin_exchange_id' })
  coinExchange: CoinExchange;
} 