import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandlesController } from './controllers/candles.controller';
import { CandlesDBController } from './controllers/candles-db.controller';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { CandlesService } from './services/candles.service';
import { Candle } from './entities/candle.entity';
import { CoinExchange } from '../exchanges/entities/coin-exchange.entity';

@Module({
  imports: [
    ExchangesModule,
    TypeOrmModule.forFeature([Candle, CoinExchange])
  ],
  controllers: [CandlesController, CandlesDBController],
  providers: [CandlesService],
})
export class CandlesModule {}
