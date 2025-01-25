export interface ExchangeTimeframeConfig {
  name: string;
  timeframe: string;
  status: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5436', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'crypto_trading',
  },
  exchanges: [
    { name: 'binance', timeframe: '1h', status: 2 },
    { name: 'binance', timeframe: '4h', status: 1 },
    { name: 'binance', timeframe: '1d', status: 1 },
    { name: 'kucoin', timeframe: '1h', status: 2 },
    { name: 'kucoin', timeframe: '4h', status: 2 },
    { name: 'kucoin', timeframe: '1d', status: 2 },
    { name: 'okx', timeframe: '1h', status: 2 },
    { name: 'okx', timeframe: '4h', status: 2 },
    { name: 'okx', timeframe: '1d', status: 2 },
  ] as ExchangeTimeframeConfig[],
  candleIntervals: ['1h', '4h', '1d'],
}); 