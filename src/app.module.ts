import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinsModule } from './coins/coins.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { TasksModule } from './tasks/tasks.module';
import { CandlesModule } from './candles/candles.module';
import { InitModule } from './init/init.module';
import configuration from './config/configuration';
import { Coin } from './coins/entities/coin.entity';
import { Exchange } from './exchanges/entities/exchange.entity';
import { CoinExchange } from './exchanges/entities/coin-exchange.entity';
import { Candle } from './candles/entities/candle.entity';
import { TimeFrame } from './exchanges/entities/timeframe.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { TimeframesModule } from './timeframes/timeframes.module';
import { TradingModule } from './trading/trading.module';
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    ScheduleModule.forRoot(),
    CoinsModule,
    ExchangesModule,
    TasksModule,
    CandlesModule,
    InitModule,
    TimeframesModule,
    TradingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
