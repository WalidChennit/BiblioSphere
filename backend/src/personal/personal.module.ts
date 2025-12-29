import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PersonalStatsController } from './personal.stats.controller';
import { PersonalStatsService } from './personal.stats.service';

@Module({
  controllers: [PersonalStatsController],
  providers: [PersonalStatsService, PrismaService],
})
export class PersonalModule {}
