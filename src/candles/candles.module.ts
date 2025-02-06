import { Module } from '@nestjs/common';
import { CandlesController } from './controllers/candles.controller';
import { CandlesDBController } from './controllers/candles-db.controller';
import { ExchangesModule } from '../exchanges/exchanges.module';

@Module({
  imports: [ExchangesModule],
  controllers: [CandlesController, CandlesDBController],
})
export class CandlesModule {}
