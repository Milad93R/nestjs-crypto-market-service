import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('candles')
@Index(['symbol', 'exchange', 'timestamp'], { unique: true })
export class Candle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column()
  exchange: string;

  @Column('bigint')
  timestamp: number;

  @Column('decimal', { precision: 18, scale: 8 })
  open: number;

  @Column('decimal', { precision: 18, scale: 8 })
  high: number;

  @Column('decimal', { precision: 18, scale: 8 })
  low: number;

  @Column('decimal', { precision: 18, scale: 8 })
  close: number;

  @Column('decimal', { precision: 18, scale: 8 })
  volume: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 