import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeframe } from '../entities/timeframe.entity';

interface AddTimeframeDto {
  name: string;
  interval: string;
  minutes: number;
}

@Injectable()
export class TimeframesService {
  private readonly logger = new Logger(TimeframesService.name);

  constructor(
    @InjectRepository(Timeframe)
    private readonly timeframeRepository: Repository<Timeframe>,
  ) {}

  async addTimeframe(dto: AddTimeframeDto): Promise<Timeframe> {
    try {
      // Check if timeframe with same interval or name already exists
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

  async findAll(): Promise<Timeframe[]> {
    return this.timeframeRepository.find({
      order: {
        minutes: 'ASC'
      }
    });
  }

  async findByInterval(interval: string): Promise<Timeframe> {
    const timeframe = await this.timeframeRepository.findOne({ where: { interval } });
    if (!timeframe) {
      throw new NotFoundException(`Timeframe with interval ${interval} not found`);
    }
    return timeframe;
  }
}