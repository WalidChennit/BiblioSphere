import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExemplaireDto } from './dto/create-exemplaire.dto';

@Injectable()
export class ExemplaireService {
  constructor(private prisma: PrismaService) {}

  // ✅ CREATE EXEMPLAIRE
  async create(dto: CreateExemplaireDto) {
    const livre = await this.prisma.livre.findUnique({
      where: { id: dto.livreId },
    });

    if (!livre) {
      throw new BadRequestException('Livre inexistant');
    }

    return this.prisma.exemplaire.create({
      data: {
        code: dto.code,
        etat: dto.etat,
        livreId: dto.livreId,
      },
    });
  }

  // ✅ TOUS LES EXEMPLAIRES
  async findAll() {
    return this.prisma.exemplaire.findMany({
      include: {
        livre: true,
      },
    });
  }

  // ✅ EXEMPLAIRES D’UN LIVRE
  async findByLivre(livreId: number) {
    return this.prisma.exemplaire.findMany({
      where: { livreId },
    });
  }

  // ✅ CHANGEMENT D’ÉTAT
  async updateEtat(id: number, etat: string) {
    return this.prisma.exemplaire.update({
      where: { id },
      data: { etat },
    });
  }

  // ✅ SUPPRESSION (AVEC SÉCURITÉ)
  async delete(id: number) {
    const ex = await this.prisma.exemplaire.findUnique({
      where: { id },
      include: {
        emprunts: true,
        reservations: true,
      },
    });

    if (!ex) {
      throw new NotFoundException('Exemplaire introuvable');
    }

    if (ex.emprunts.length > 0 || ex.reservations.length > 0) {
      throw new BadRequestException(
        'Impossible de supprimer : exemplaire utilisé',
      );
    }

    return this.prisma.exemplaire.delete({
      where: { id },
    });
  }
}
