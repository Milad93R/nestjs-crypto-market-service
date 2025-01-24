import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Coin } from './coin.entity';
import { Exchange } from '../../exchanges/entities/exchange.entity';

export enum ExchangeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELISTED = 'delisted'
}

@Entity('coin_exchanges')
export class CoinExchange {
  @PrimaryColumn('uuid')
  coin_id: string;

  @PrimaryColumn('uuid')
  exchange_id: string;

  @Column({
    type: 'enum',
    enum: ExchangeStatus,
    default: ExchangeStatus.ACTIVE
  })
  exchange_status: ExchangeStatus;

  @ManyToOne(() => Coin, coin => coin.exchanges)
  @JoinColumn({ name: 'coin_id' })
  coin: Coin;

  @ManyToOne(() => Exchange, exchange => exchange.coins)
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;
} 