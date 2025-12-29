import { Module } from '@nestjs/common';
import { EmpruntService } from './emprunt.service';
import { EmpruntController } from './emprunt.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EmpruntController],
  providers: [EmpruntService, PrismaService],
  exports: [EmpruntService],
})
export class EmpruntModule {}
