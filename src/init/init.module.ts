import { Module } from '@nestjs/common';
import { InitController } from './init.controller';
import { InitService } from './init.service';
import { ExchangesModule } from '../exchanges/exchanges.module';
import { CoinsModule } from '../coins/coins.module';
import { TimeframesModule } from '../timeframes/timeframes.module';

@Module({
  imports: [ExchangesModule, CoinsModule, TimeframesModule],
  controllers: [InitController],
  providers: [InitService],
})
export class InitModule {} 