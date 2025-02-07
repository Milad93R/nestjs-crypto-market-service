import { Controller, Post, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { InitService } from './init.service';

@Controller('init')
export class InitController {
  private readonly logger = new Logger(InitController.name);

  constructor(private readonly initService: InitService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async initialize() {
    try {
      await this.initService.initializeData();
      return { message: 'Initialization completed successfully' };
    } catch (error) {
      this.logger.error(`Failed to initialize data: ${error.message}`);
      throw error;
    }
  }
} 