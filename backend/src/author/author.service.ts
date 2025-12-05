import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';

@Injectable()
export class AuthorService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE
  async create(dto: CreateAuthorDto) {
    // Map API DTO (`nom`) to Prisma model field (`name`)
    const exists = await this.prisma.author.findFirst({
      where: {
        nom: dto.nom,
        prenom: dto.prenom,
      },
    });

    if (exists) {
      throw new BadRequestException('Cet auteur existe déjà');
    }

    return this.prisma.author.create({
      data: {
        nom: dto.nom,
        prenom: dto.prenom,
      },
    });
  }

  // ✅ GET ALL
  async findAll() {
    return this.prisma.author.findMany({
      include: {
        livres: {
          include: { livre: true },
        },
      },
    });
  }

  // ✅ GET ONE
  async findOne(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: {
        livres: {
          include: { livre: true },
        },
      },
    });

    if (!author) throw new NotFoundException('Auteur introuvable');
    return author;
  }

  // ✅ UPDATE
  async update(id: number, dto: UpdateAuthorDto) {
    const author = await this.prisma.author.findUnique({ where: { id } });
    if (!author) throw new NotFoundException('Auteur introuvable');

    // Map optional DTO fields to Prisma field names
    const data: any = {};
    if (dto.nom !== undefined) data.name = dto.nom;
    if (dto.prenom !== undefined) data.prenom = dto.prenom;

    return this.prisma.author.update({
      where: { id },
      data,
    });
  }

  // ✅ DELETE (SI AUCUN LIVRE)
  async remove(id: number) {
    const author = await this.prisma.author.findUnique({
      where: { id },
      include: { livres: true },
    });

    if (!author) throw new NotFoundException('Auteur introuvable');

    if (author.livres.length > 0) {
      throw new BadRequestException(
        'Suppression impossible : auteur lié à des livres',
      );
    }

    return this.prisma.author.delete({ where: { id } });
  }
}
