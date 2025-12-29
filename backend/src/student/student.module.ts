import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StudentStatsController } from './student.stats.controller';
import { StudentStatsService } from './student.stats.service';

@Module({
  controllers: [StudentStatsController],
  providers: [StudentStatsService, PrismaService],
})
export class StudentModule {}
