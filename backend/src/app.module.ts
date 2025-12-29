import { Module } from '@nestjs/common';
import { PersonalUserModule } from './personal-user/personal-user.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { EditorModule } from './editor/editor.module';
// Exemplaire module removed in favor of count-based inventory
import { EmpruntModule } from './emprunt/emprunt.module';
import { ReservationModule } from './reservation/reservation.module';
import { UploadModule } from './upload/upload.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { StudentModule } from './student/student.module';
import { PersonalModule } from './personal/personal.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    PersonalUserModule,
    UserModule,
    BookModule,
    CategoryModule,
    AuthorModule,
    EditorModule,
    EmpruntModule,
    ReservationModule,
    UploadModule,
    AuthModule,
    StudentModule,
    PersonalModule,
    AdminModule,
  ],
})
export class AppModule {}
