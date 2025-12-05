import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE LIVRE COMPLET
  async create(dto: CreateBookDto) {
    const isbnExists = await this.prisma.livre.findUnique({
      where: { isbn: dto.isbn },
    });

    if (isbnExists) {
      throw new BadRequestException('ISBN déjà existant');
    }

    return this.prisma.livre.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        isbn: dto.isbn,
        anneePublication: dto.anneePublication,
        langue: dto.langue,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        editorId: dto.editorId,

        auteurs: {
          create: dto.authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
      include: {
        category: true,
        editor: true,
        auteurs: { include: { author: true } },
      },
    });
  }

  // ✅ GET ALL LIVRES (COMPLET)
  async findAll() {
    return this.prisma.livre.findMany({
      include: {
        category: true,
        editor: true,
        auteurs: { include: { author: true } },
        exemplaires: true,
      },
    });
  }

  // ✅ GET ONE LIVRE
  async findOne(id: number) {
    const livre = await this.prisma.livre.findUnique({
      where: { id },
      include: {
        category: true,
        editor: true,
        auteurs: { include: { author: true } },
        exemplaires: true,
      },
    });

    if (!livre) throw new NotFoundException('Livre introuvable');
    return livre;
  }

  // ✅ UPDATE LIVRE
  async update(id: number, dto: UpdateBookDto) {
    const livre = await this.prisma.livre.findUnique({ where: { id } });
    if (!livre) throw new NotFoundException('Livre introuvable');

    return this.prisma.livre.update({
      where: { id },
      data: {
        ...dto,
        auteurs: dto.authorIds
          ? {
              deleteMany: {},
              create: dto.authorIds.map((authorId) => ({
                author: { connect: { id: authorId } },
              })),
            }
          : undefined,
      },
    });
  }

  // ✅ DELETE LIVRE (SI AUCUN EXEMPLAIRE)
  async remove(id: number) {
    const livre = await this.prisma.livre.findUnique({
      where: { id },
      include: { exemplaires: true },
    });

    if (!livre) throw new NotFoundException('Livre introuvable');

    if (livre.exemplaires.length > 0) {
      throw new BadRequestException(
        'Suppression impossible : des exemplaires existent encore',
      );
    }

    return this.prisma.livre.delete({ where: { id } });
  }
}
