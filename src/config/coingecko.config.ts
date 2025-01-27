import { registerAs } from '@nestjs/config';

export default registerAs('coingecko', () => ({
  apiUrl: process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3',
  apiKey: process.env.COINGECKO_API_KEY,
  requestDelay: parseInt(process.env.COINGECKO_REQUEST_DELAY || '1000', 10),
  topCoinsLimit: parseInt(process.env.COINGECKO_TOP_COINS_LIMIT || '100', 10),
})); 