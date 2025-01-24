import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CoinExchange } from './coin-exchange.entity';

@Entity('coins')
export class Coin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  symbol: string;

  @OneToMany(() => CoinExchange, coinExchange => coinExchange.coin)
  exchanges: CoinExchange[];
} 