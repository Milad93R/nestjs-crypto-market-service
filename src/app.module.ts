import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinsModule } from './coins/coins.module';
import { CandlesModule } from './candles/candles.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [CoinsModule, CandlesModule, ExchangesModule, TasksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
