import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    return await this.prisma.user.create({
      data: {
        email: dto.email,
        prenom: dto.firstname,
        nom: dto.lastname,
        nin: dto.nin,
        matricule: dto.matricule,
        dateDeNaissance: new Date(dto.birthDate),
        telephone: dto.phone,
        role: dto.role,
        createdAt: new Date(),
      },
    });
  }

  // ⭐⭐⭐ MÉTHODE FINDALL MANQUANTE
  async findAll() {
    return await this.prisma.user.findMany();
  }
}
