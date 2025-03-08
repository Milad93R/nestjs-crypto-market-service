import { DataSource } from 'typeorm';
import { Coin } from '../coins/entities/coin.entity';
import { Exchange } from '../exchanges/entities/exchange.entity';
import { CoinExchange } from '../exchanges/entities/coin-exchange.entity';
import { Candle } from '../candles/entities/candle.entity';
import { TimeFrame } from '../exchanges/entities/timeframe.entity';
import { Position } from '../trading/entities/position.entity';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

// For TypeORM CLI migrations
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5436', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crypto_trading',
  entities: [Coin, Exchange, CoinExchange, Candle, TimeFrame, Position],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});

// For NestJS TypeORM module
export const typeOrmConfig = (configService: ConfigService) => ({
  type: 'postgres',
  host: configService.get('database.host'),
  port: configService.get('database.port'),
  username: configService.get('database.username'),
  password: configService.get('database.password'),
  database: configService.get('database.database'),
  entities: [Coin, Exchange, CoinExchange, Candle, TimeFrame, Position],
  synchronize: false,
  logging: ['error'],
  logger: 'advanced-console'
}); 