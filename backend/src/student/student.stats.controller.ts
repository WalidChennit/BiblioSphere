import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { StudentStatsService } from './student.stats.service';

@ApiTags('Student')
@Controller('student')
export class StudentStatsController {
  constructor(private readonly service: StudentStatsService) {}

  @Get(':userId/stats')
  @ApiOperation({ summary: 'Student dashboard stats' })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  stats(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.getStats(userId);
  }
}
