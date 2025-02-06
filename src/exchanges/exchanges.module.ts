import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CCXTService } from './services/ccxt.service';
import { CoinExchangeService } from './services/coin-exchange.service';
import { TimeframesService } from './services/timeframes.service';
import { ExchangesService } from './services/exchanges.service';
import { CoinExchangesController } from './controllers/coin-exchanges.controller';
import { TimeframesController } from './controllers/timeframes.controller';
import { ExchangesController } from './controllers/exchanges.controller';
import { Candle } from './entities/candle.entity';
import { TimeFrame } from './entities/timeframe.entity';
import { CoinExchange } from './entities/coin-exchange.entity';
import { Exchange } from './entities/exchange.entity';
import { Coin } from '../coins/entities/coin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Candle, TimeFrame, CoinExchange, Exchange, Coin]),
    ConfigModule,
  ],
  providers: [CCXTService, CoinExchangeService, TimeframesService, ExchangesService],
  exports: [CCXTService],
  controllers: [CoinExchangesController, TimeframesController, ExchangesController],
})
export class ExchangesModule {}
