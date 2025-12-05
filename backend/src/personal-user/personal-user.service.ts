import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonalUserDto } from './dto/create-personal-user.dto';

@Injectable()
export class PersonalUserService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePersonalUserDto) {
    const createData: any = {
      prenom: data.firstName,
      nom: data.lastName,
      email: data.email,
      nin: data.nin,
      telephone: data.phone ?? '',
      role: 'personnel',
    };

    if (data.birthDate) createData.dateDeNaissance = new Date(data.birthDate);

    return this.prisma.user.create({ data: createData });
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
