import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoinExchange } from '../../exchanges/entities/coin-exchange.entity';

@Entity('coins')
export class Coin {
  @ApiProperty({
    description: 'The unique identifier of the coin',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The name of the coin',
    example: 'Bitcoin'
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'The symbol of the coin',
    example: 'BTC'
  })
  @Column({ unique: true })
  symbol: string;

  @ApiProperty({
    description: 'The exchanges where this coin is traded',
    type: () => [CoinExchange]
  })
  @OneToMany(() => CoinExchange, coinExchange => coinExchange.coin)
  exchanges: CoinExchange[];
} 