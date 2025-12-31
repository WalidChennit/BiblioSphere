import { forwardRef, Module } from '@nestjs/common';
import { AuthorService } from './author.service';
import { AuthorController } from './author.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [NotificationModule, forwardRef(() => AuthModule)],
  controllers: [AuthorController],
  providers: [AuthorService, PrismaService],
})
export class AuthorModule {}
