import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeFrame } from '../entities/timeframe.entity';

interface AddTimeframeDto {
  name: string;
  interval: string;
  minutes: number;
}

@Injectable()
export class TimeframesService {
  private readonly logger = new Logger(TimeframesService.name);

  constructor(
    @InjectRepository(TimeFrame)
    private readonly timeframeRepository: Repository<TimeFrame>,
  ) {}

  async addTimeframe(dto: AddTimeframeDto): Promise<TimeFrame> {
    try {
      // Check if timeframe with same interval already exists
      const existing = await this.timeframeRepository.findOne({
        where: [
          { interval: dto.interval },
          { name: dto.name }
        ]
      });

      if (existing) {
        throw new ConflictException(
          `Timeframe with interval ${dto.interval} or name ${dto.name} already exists`
        );
      }

      // Create new timeframe
      const timeframe = this.timeframeRepository.create({
        name: dto.name,
        interval: dto.interval,
        minutes: dto.minutes
      });

      return this.timeframeRepository.save(timeframe);
    } catch (error) {
      this.logger.error(`Failed to add timeframe: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<TimeFrame[]> {
    return this.timeframeRepository.find({
      order: {
        minutes: 'ASC'
      }
    });
  }
} 