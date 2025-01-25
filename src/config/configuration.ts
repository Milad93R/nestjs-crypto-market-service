export interface ExchangeConfig {
  name: string;
  apiKey?: string;
  secret?: string;
  timeout?: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'crypto_trading',
  },
  exchanges: [
    {
      name: 'binance',
      timeout: 30000,
    },
    {
      name: 'coinbase',
      timeout: 30000,
    },
  ] as ExchangeConfig[],
  candleIntervals: ['1m', '5m', '15m', '1h', '4h', '1d'],
}); 