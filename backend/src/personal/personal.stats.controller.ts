import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PersonalStatsService } from './personal.stats.service';

@ApiTags('Personal')
@Controller('personal')
export class PersonalStatsController {
  constructor(private readonly service: PersonalStatsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Stats dashboard personnel' })
  stats() {
    return this.service.stats();
  }
}
