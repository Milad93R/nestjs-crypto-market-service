import { Injectable, Logger } from '@nestjs/common';
import { TimeframesService } from '../timeframes/services/timeframes.service';
import { ExchangesService } from '../exchanges/services/exchanges.service';
import { CoinService } from '../coins/services/coin.service';

interface TimeFrame {
  name: string;
  interval: string;
  minutes: number;
}

interface Coin {
  name: string;
  symbol: string;
}

@Injectable()
export class InitService {
  private readonly logger = new Logger(InitService.name);

  private readonly timeframes: TimeFrame[] = [
    { name: '4 Hours', interval: '4h', minutes: 240 },
    { name: '1 Day', interval: '1d', minutes: 1440 },
  ];

  private readonly coins: Coin[] = [
    { name: 'Bitcoin', symbol: 'BTC' },
    { name: 'Ethereum', symbol: 'ETH' },
    { name: 'XRP', symbol: 'XRP' },
    { name: 'Stellar', symbol: 'XLM' },
    { name: 'Toncoin', symbol: 'TON' },
    { name: 'The Sandbox', symbol: 'SAND' },
    { name: 'Ravencoin', symbol: 'RVN' },
    { name: 'Oasis Network', symbol: 'ROSE' },
    { name: 'Harmony', symbol: 'ONE' },
    { name: 'NEAR Protocol', symbol: 'NEAR' },
    { name: 'Injective', symbol: 'INJ' },
    { name: 'Holo', symbol: 'HOT' },
    { name: 'Cardano', symbol: 'ADA' },
    { name: 'Filecoin', symbol: 'FIL' },
    { name: 'Ethereum Classic', symbol: 'ETC' },
    { name: 'Enjin Coin', symbol: 'ENJ' },
    { name: 'MultiversX', symbol: 'EGLD' },
    { name: 'Polkadot', symbol: 'DOT' },
    { name: 'Dogecoin', symbol: 'DOGE' },
    { name: 'Pepe', symbol: 'PEPE' },
    { name: 'Floki', symbol: 'FLOKI' },
    { name: 'Shiba Inu', symbol: 'SHIB' },
    { name: 'Compound', symbol: 'COMP' },
    { name: 'BNB', symbol: 'BNB' },
    { name: 'Avalanche', symbol: 'AVAX' },
    { name: 'Theta Network', symbol: 'THETA' },
    { name: 'VeChain', symbol: 'VET' },
  ];

  constructor(
    private readonly timeframesService: TimeframesService,
    private readonly exchangesService: ExchangesService,
    private readonly coinService: CoinService,
  ) {}

  async initializeData() {
    try {
      this.logger.log('Starting initialization...');

      // Add timeframes
      this.logger.log('Adding timeframes...');
      for (const timeframe of this.timeframes) {
        try {
          await this.timeframesService.addTimeframe(timeframe);
          this.logger.log(`✅ Added timeframe: ${timeframe.interval}`);
        } catch (error) {
          if (error.message?.includes('already exists')) {
            this.logger.log(`ℹ️ Timeframe ${timeframe.interval} already exists`);
          } else {
            this.logger.error(`❌ Failed to add timeframe ${timeframe.interval}: ${error.message}`);
          }
        }
      }

      // Add Binance exchange
      this.logger.log('Adding Binance exchange...');
      try {
        await this.exchangesService.addExchange({ name: 'binance' });
        this.logger.log('✅ Added Binance exchange');
      } catch (error) {
        if (error.message?.includes('already exists')) {
          this.logger.log('ℹ️ Binance exchange already exists');
        } else {
          this.logger.error(`❌ Failed to add Binance: ${error.message}`);
        }
      }

      // Add coins
      this.logger.log('Adding coins...');
      for (const coin of this.coins) {
        try {
          await this.coinService.addCoin(coin);
          this.logger.log(`✅ Added coin: ${coin.symbol}`);
        } catch (error) {
          if (error.message?.includes('already exists')) {
            this.logger.log(`ℹ️ Coin ${coin.symbol} already exists`);
          } else {
            this.logger.error(`❌ Failed to add coin ${coin.symbol}: ${error.message}`);
          }
        }
      }

      this.logger.log('Initialization completed successfully!');
    } catch (error) {
      this.logger.error('Failed to initialize data:', error.message);
      throw error;
    }
  }
} 