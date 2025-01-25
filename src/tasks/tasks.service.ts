import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CoinService } from '../coins/services/coin.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly coinService: CoinService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateCoins() {
    this.logger.log('Starting daily coin update...');
    try {
      await this.coinService.updateCoins();
      this.logger.log('Daily coin update completed successfully');
    } catch (error) {
      this.logger.error(`Error in daily coin update: ${error.message}`, error.stack);
    }
  }
} 