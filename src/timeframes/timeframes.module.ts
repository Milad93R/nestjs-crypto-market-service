import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeframesService } from './services/timeframes.service';
import { TimeframesController } from './controllers/timeframes.controller';
import { Timeframe } from './entities/timeframe.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timeframe])],
  providers: [TimeframesService],
  controllers: [TimeframesController],
  exports: [TimeframesService],
})
export class TimeframesModule {} 