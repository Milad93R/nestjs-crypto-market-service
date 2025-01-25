import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CCXTService } from './services/ccxt.service';
import { Candle } from './entities/candle.entity';
import { TimeFrame } from './entities/timeframe.entity';
import { CoinExchange } from './entities/coin-exchange.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candle, TimeFrame, CoinExchange]),
    ConfigModule,
  ],
  providers: [CCXTService],
  exports: [CCXTService],
})
export class ExchangesModule {}
