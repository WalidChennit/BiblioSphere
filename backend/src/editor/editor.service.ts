import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEditorDto } from './dto/create-editor.dto';

@Injectable()
export class EditorService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEditorDto) {
    const exists = await this.prisma.editor.findUnique({
      where: { name: dto.name },
    });

    if (exists) {
      throw new BadRequestException('Cet éditeur existe déjà');
    }

    return this.prisma.editor.create({
      data: { name: dto.name },
    });
  }

  async findAll() {
    return this.prisma.editor.findMany({
      include: { livres: true },
    });
  }

  async remove(id: number) {
    const editor = await this.prisma.editor.findUnique({
      where: { id },
      include: { livres: true },
    });

    if (!editor) {
      throw new NotFoundException('Éditeur introuvable');
    }

    if (editor.livres.length > 0) {
      throw new BadRequestException(
        'Suppression impossible : des livres sont encore associés à cet éditeur',
      );
    }

    return this.prisma.editor.delete({
      where: { id },
    });
  }
}
