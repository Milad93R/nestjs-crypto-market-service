import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Coin } from '../../coins/entities/coin.entity';
import { Exchange } from '../../exchanges/entities/exchange.entity';

@Entity('candles')
@Index(['coin_id', 'exchange_id', 'timestamp'])
export class Candle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  coin_id: string;

  @Column('uuid')
  exchange_id: string;

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

  @ManyToOne(() => Coin)
  @JoinColumn({ name: 'coin_id' })
  coin: Coin;

  @ManyToOne(() => Exchange)
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;
} 