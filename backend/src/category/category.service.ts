import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  // ✅ AJOUT AVEC VÉRIFICATION D'EXISTENCE
  async create(dto: CreateCategoryDto) {
    const exists = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Cette catégorie existe déjà');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
      },
    });
  }

  // ✅ LISTE
  async findAll() {
    return this.prisma.category.findMany({
      include: { livres: true },
    });
  }

  // ✅ SUPPRESSION CONDITIONNELLE
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { livres: true },
    });

    if (!category) {
      throw new NotFoundException('Catégorie introuvable');
    }

    if (category.livres.length > 0) {
      throw new BadRequestException(
        'Suppression impossible : des livres sont encore associés à cette catégorie',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
