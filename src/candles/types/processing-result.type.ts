import { ApiProperty } from '@nestjs/swagger';

export class ProcessingResultDetail {
  @ApiProperty({ description: 'The coin symbol', example: 'BTC' })
  coin: string;

  @ApiProperty({ description: 'The exchange name', example: 'binance' })
  exchange: string;

  @ApiProperty({ description: 'The timeframe interval', example: '1h' })
  timeframe: string;

  @ApiProperty({ description: 'The processing status', example: 'success' })
  status: string;

  @ApiProperty({ description: 'Error message if status is error', required: false })
  error?: string;
}

export class ProcessingResult {
  @ApiProperty({ description: 'Number of successfully processed pairs' })
  processed: number;

  @ApiProperty({ description: 'Number of errors encountered' })
  errors: number;

  @ApiProperty({ description: 'Details for each processed pair', type: [ProcessingResultDetail] })
  details: ProcessingResultDetail[];
}

export class ProcessingResponse {
  @ApiProperty({ description: 'Summary message of the operation' })
  message: string;

  @ApiProperty({ description: 'Detailed processing results', type: ProcessingResult })
  details: ProcessingResult;
} 