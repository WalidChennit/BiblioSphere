import { Module } from '@nestjs/common';
import { PersonalUserModule } from './personal-user/personal-user.module';
import { PrismaService } from './prisma/prisma.service';
import { UserModule } from './user/user.module';
import { BookModule } from './book/book.module';
import { CategoryModule } from './category/category.module';
import { AuthorModule } from './author/author.module';
import { EditorModule } from './editor/editor.module';
import { ExemplaireModule } from './exemplaire/exemplaire.module';

@Module({
  imports: [PersonalUserModule, UserModule, BookModule,CategoryModule, AuthorModule, EditorModule,ExemplaireModule],
  providers: [PrismaService],
})
export class AppModule {}
