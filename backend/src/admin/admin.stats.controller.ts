import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminStatsService } from './admin.stats.service';

@ApiTags('admin')
@Controller('admin')
export class AdminStatsController {
  constructor(private readonly service: AdminStatsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  stats(@Query('period') period?: string) {
    return this.service.stats(period);
  }
}
