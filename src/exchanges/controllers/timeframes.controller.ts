import { Controller, Post, Body, HttpException, HttpStatus, Logger, Get } from '@nestjs/common';
import { TimeframesService } from '../services/timeframes.service';

interface AddTimeframeDto {
  name: string;      // e.g., "1 Hour", "4 Hours", "1 Day"
  interval: string;  // e.g., "1h", "4h", "1d"
  minutes: number;   // e.g., 60, 240, 1440
}

@Controller('timeframes')
export class TimeframesController {
  private readonly logger = new Logger(TimeframesController.name);

  constructor(private readonly timeframesService: TimeframesService) {}

  @Post()
  async addTimeframe(@Body() dto: AddTimeframeDto) {
    try {
      const timeframe = await this.timeframesService.addTimeframe(dto);
      return {
        message: 'Timeframe added successfully',
        data: timeframe
      };
    } catch (error) {
      this.logger.error(`Failed to add timeframe: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to add timeframe',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async getAllTimeframes() {
    try {
      const timeframes = await this.timeframesService.findAll();
      return {
        data: timeframes
      };
    } catch (error) {
      this.logger.error(`Failed to get timeframes: ${error.message}`);
      throw new HttpException(
        error.message || 'Failed to get timeframes',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 