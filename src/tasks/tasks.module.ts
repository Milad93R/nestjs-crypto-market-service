import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CoinsModule } from '../coins/coins.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CoinsModule,
  ],
  providers: [TasksService],
})
export class TasksModule {}
