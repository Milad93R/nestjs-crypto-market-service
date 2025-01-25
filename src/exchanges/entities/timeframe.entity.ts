import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CoinExchange } from './coin-exchange.entity';

@Entity('timeframes')
export class TimeFrame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  interval: string;

  @Column('int')
  minutes: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => CoinExchange, coinExchange => coinExchange.timeframe)
  coinExchanges: CoinExchange[];
} 