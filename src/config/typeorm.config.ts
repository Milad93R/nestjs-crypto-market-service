import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Coin } from '../coins/entities/coin.entity';
import { Exchange } from '../exchanges/entities/exchange.entity';
import { CoinExchange } from '../coins/entities/coin-exchange.entity';
import { Candle } from '../candles/entities/candle.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5436', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'crypto_trading',
  entities: [Coin, Exchange, CoinExchange, Candle],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
}; 