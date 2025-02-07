import { Entity, Column, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CoinExchange } from './coin-exchange.entity';

@Entity('timeframes')
export class TimeFrame {
  @ApiProperty({
    description: 'The unique identifier of the timeframe',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The display name of the timeframe',
    example: '1 Hour'
  })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    description: 'The interval code for the timeframe',
    example: '1h'
  })
  @Column({ unique: true })
  interval: string;

  @ApiProperty({
    description: 'The number of minutes in the timeframe',
    example: 60
  })
  @Column('int')
  minutes: number;

  @ApiProperty({
    description: 'The creation timestamp',
    example: '2024-02-06T17:48:13.998Z'
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'The last update timestamp',
    example: '2024-02-06T17:48:13.998Z'
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    description: 'The coin-exchange pairs using this timeframe',
    type: () => [CoinExchange]
  })
  @OneToMany(() => CoinExchange, coinExchange => coinExchange.timeframe)
  coinExchanges: CoinExchange[];
} 