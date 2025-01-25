import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinsModule } from './coins/coins.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { TasksModule } from './tasks/tasks.module';
import configuration from './config/configuration';
import { Coin } from './coins/entities/coin.entity';
import { Exchange } from './exchanges/entities/exchange.entity';
import { CoinExchange } from './exchanges/entities/coin-exchange.entity';
import { Candle } from './candles/entities/candle.entity';
import { TimeFrame } from './exchanges/entities/timeframe.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [Coin, Exchange, CoinExchange, Candle, TimeFrame],
        synchronize: false,
        logging: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    CoinsModule,
    ExchangesModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
