import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { PositionService } from './services/position.service';
import { PositionController } from './controllers/position.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Position]),
  ],
  controllers: [PositionController],
  providers: [PositionService],
  exports: [PositionService],
})
export class TradingModule {} 