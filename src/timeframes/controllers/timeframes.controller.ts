import { Controller, Post, Body, HttpException, HttpStatus, Logger, Get } from '@nestjs/common';
import { TimeframesService } from '../services/timeframes.service';
import { TimeFrame } from '../../exchanges/entities/timeframe.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddTimeframeDto {
  @ApiProperty({
    description: 'The display name of the timeframe',
    example: '1 Hour'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The interval code for the timeframe',
    example: '1h'
  })
  @IsString()
  @IsNotEmpty()
  interval: string;

  @ApiProperty({
    description: 'The number of minutes in the timeframe',
    example: 60
  })
  @IsNumber()
  @Min(1)
  minutes: number;
}

@ApiTags('timeframes')
@Controller('timeframes')
export class TimeframesController {
  private readonly logger = new Logger(TimeframesController.name);

  constructor(private readonly timeframesService: TimeframesService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new timeframe' })
  @ApiResponse({ status: 201, description: 'The timeframe has been successfully created.', type: TimeFrame })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 409, description: 'Timeframe already exists.' })
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
  @ApiOperation({ summary: 'Get all timeframes' })
  @ApiResponse({ status: 200, description: 'Return all timeframes.', type: [TimeFrame] })
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