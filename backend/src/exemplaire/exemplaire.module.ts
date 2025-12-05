import { Module } from '@nestjs/common';
import { ExemplaireService } from './exemplaire.service';
import { ExemplaireController } from './exemplaire.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ExemplaireController],
  providers: [ExemplaireService, PrismaService],
})
export class ExemplaireModule {}
