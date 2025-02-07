import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('timeframes')
export class Timeframe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  interval: string;

  @Column()
  minutes: number;
}