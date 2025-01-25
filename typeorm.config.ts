import { DataSource } from 'typeorm';
import { Coin } from './src/coins/entities/coin.entity';
import { Exchange } from './src/exchanges/entities/exchange.entity';
import { CoinExchange } from './src/coins/entities/coin-exchange.entity';
import { Candle } from './src/candles/entities/candle.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5436),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'crypto_trading',
  entities: [Coin, Exchange, CoinExchange, Candle],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
}); 