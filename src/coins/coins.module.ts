import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coin } from './entities/coin.entity';
import { CoinService } from './services/coin.service';
import { CoinGeckoService } from './services/coingecko.service';
import { CoinsController } from './controllers/coins.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Coin])],
  providers: [CoinService, CoinGeckoService],
  exports: [CoinService],
  controllers: [CoinsController],
})
export class CoinsModule {}
