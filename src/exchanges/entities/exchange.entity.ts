import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CoinExchange } from './coin-exchange.entity';

@Entity('exchanges')
export class Exchange {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @OneToMany(() => CoinExchange, coinExchange => coinExchange.exchange)
  coinExchanges: CoinExchange[];
} 