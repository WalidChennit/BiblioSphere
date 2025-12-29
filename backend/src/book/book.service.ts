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

    const initialCount = dto.nombreExemplaires ?? 0;
    const livre = await this.prisma.livre.create({
      data: {
        titre: dto.titre,
        description: dto.description,
        isbn: dto.isbn,
        anneePublication: dto.anneePublication,
        langue: dto.langue,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        editorId: dto.editorId,
        stockTotal: initialCount,
        stockDisponible: initialCount,
        reservedCount: 0,
        borrowedCount: 0,

        auteurs: {
          create: dto.authorIds.map((authorId) => ({
            author: { connect: { id: authorId } },
          })),
        },
      },
      include: { category: true, editor: true, auteurs: { include: { author: true } } },
    });

    // Si des réservations en attente existent déjà pour ce livre,
    // on les convertit en 'disponible' tant qu'il reste du stockDisponible
    if (initialCount > 0) {
      const pending = await this.prisma.reservation.findMany({
        where: { livreId: livre.id, statut: 'en_attente' },
        orderBy: { dateReservation: 'asc' },
        select: { id: true },
      });
      const toFulfill = Math.min(initialCount, pending.length);
      if (toFulfill > 0) {
        const ids = pending.slice(0, toFulfill).map((r) => r.id);
        await this.prisma.$transaction([
          this.prisma.reservation.updateMany({ where: { id: { in: ids } }, data: { statut: 'disponible' } }),
          this.prisma.livre.update({
            where: { id: livre.id },
            data: {
              reservedCount: { increment: toFulfill },
              stockDisponible: { decrement: toFulfill },
            },
          }),
        ]);
      }
    }

    return this.findOne(livre.id);
  }

  // ✅ GET ALL LIVRES (COMPLET)
  async findAll() {
    return this.prisma.livre.findMany({ include: { category: true, editor: true, auteurs: { include: { author: true } } } });
  }

  // ✅ GET ONE LIVRE
  async findOne(id: number) {
    const livre = await this.prisma.livre.findUnique({
      where: { id },
      include: { category: true, editor: true, auteurs: { include: { author: true } } },
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
    const livre = await this.prisma.livre.findUnique({ where: { id } });

    if (!livre) throw new NotFoundException('Livre introuvable');

    if (livre.borrowedCount > 0 || livre.reservedCount > 0) {
      throw new BadRequestException('Suppression impossible : des emprunts ou réservations en cours');
    }

    return this.prisma.livre.delete({ where: { id } });
  }
}
