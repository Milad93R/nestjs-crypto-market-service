import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('timeframes')
export class Timeframe {
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
  @Column()
  minutes: number;
}