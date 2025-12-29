import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminStatsController } from './admin.stats.controller';
import { AdminStatsService } from './admin.stats.service';

@Module({
  controllers: [AdminStatsController],
  providers: [AdminStatsService, PrismaService],
})
export class AdminModule {}
