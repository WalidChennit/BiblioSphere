import { Module } from '@nestjs/common';
import { PersonalUserService } from './personal-user.service';
import { PersonalUserController } from './personal-user.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PersonalUserController],
  providers: [PersonalUserService, PrismaService],
})
export class PersonalUserModule {}
