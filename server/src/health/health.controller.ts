import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check application health' })
  @ApiResponse({ status: 200, description: 'Application is healthy.', schema: { example: { status: 'ok' } } })
  checkHealth() {
    // Basic health check - returns ok
    // More advanced checks could ping DB, check external services, etc.
    return { status: 'ok' };
  }
} 