import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeframesService } from './services/timeframes.service';
import { TimeframesController } from './controllers/timeframes.controller';
import { TimeFrame } from '../exchanges/entities/timeframe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimeFrame])],
  providers: [TimeframesService],
  controllers: [TimeframesController],
  exports: [TimeframesService],
})
export class TimeframesModule {} 