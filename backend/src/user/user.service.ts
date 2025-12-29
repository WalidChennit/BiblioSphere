import {
  ConflictException,
  ForbiddenException,
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import type { AuthService } from '../auth/auth.service';
import { Prisma, UserStatus } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          prenom: dto.firstname,
          nom: dto.lastname,
          nin: dto.nin,
          matricule: dto.matricule,
          dateDeNaissance: new Date(dto.birthDate),
          telephone: dto.phone,
          passwordHash,
          role: dto.role,
          createdAt: new Date(),
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const fields = Array.isArray((err.meta as any)?.target)
          ? ((err.meta as any).target as string[])
          : [];
        if (fields.includes('nin')) {
          throw new ConflictException('NIN already exists');
        }
        if (fields.includes('email')) {
          throw new ConflictException('Email already exists');
        }
        throw new ConflictException('Unique constraint violation');
      }
      throw err;
    }
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        passwordHash: true,
      },
    });
  }

  // ⭐⭐⭐ MÉTHODE FINDALL MANQUANTE
  async findAll() {
    return await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        nin: true,
        matricule: true,
        dateDeNaissance: true,
        telephone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateStatusAsAdmin(params: {
    id: number;
    status: UserStatus;
    sessionToken?: string;
    res: Response;
    auth: AuthService;
  }) {
    const { id, status, sessionToken, res, auth } = params;

    if (!sessionToken) throw new UnauthorizedException('Missing session');
    const payload = await auth.verifyToken(sessionToken);
    if (payload.role !== 'admin') throw new ForbiddenException('Admin only');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        nin: true,
        matricule: true,
        dateDeNaissance: true,
        telephone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // If the admin just disabled the currently logged-in user, force logout.
    if (status === UserStatus.INACTIVE && payload.sub === id) {
      res.clearCookie('session', { path: '/' });
    }

    return updated;
  }

  async updateMe(params: {
    sessionToken?: string;
    auth: AuthService;
    data: { email?: string; telephone?: string; matricule?: string };
  }) {
    const { sessionToken, auth, data } = params;
    if (!sessionToken) throw new UnauthorizedException('Missing session');

    const payload = await auth.verifyToken(sessionToken);
    if (!payload.sub || payload.sub === 0) {
      throw new ForbiddenException('Not allowed');
    }

    const email = data.email?.trim();
    const telephone = data.telephone?.trim();
    const matricule = data.matricule?.trim();

    if (email !== undefined && email.length === 0) {
      throw new BadRequestException('Email cannot be empty');
    }
    if (telephone !== undefined && telephone.length === 0) {
      throw new BadRequestException('Telephone cannot be empty');
    }
    if (matricule !== undefined && matricule.length === 0) {
      throw new BadRequestException('Matricule cannot be empty');
    }

    if (matricule !== undefined) {
      const role = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { role: true },
      });
      if (role?.role !== 'etudiant') {
        throw new ForbiddenException('Matricule can only be updated for students');
      }
    }

    try {
      const updated = await this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          ...(email !== undefined ? { email } : {}),
          ...(telephone !== undefined ? { telephone } : {}),
          ...(matricule !== undefined ? { matricule } : {}),
        },
        select: {
          id: true,
          email: true,
          prenom: true,
          nom: true,
          nin: true,
          matricule: true,
          dateDeNaissance: true,
          telephone: true,
          role: true,
          status: true,
          createdAt: true,
        },
      });

      return { ok: true, user: updated };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        const fields = Array.isArray((err.meta as any)?.target)
          ? ((err.meta as any).target as string[])
          : [];
        if (fields.includes('email')) throw new ConflictException('Email already exists');
        if (fields.includes('matricule')) throw new ConflictException('Matricule already exists');
        throw new ConflictException('Unique constraint violation');
      }
      throw err;
    }
  }

  async changeMyPassword(params: {
    sessionToken?: string;
    auth: AuthService;
    currentPassword: string;
    newPassword: string;
  }) {
    const { sessionToken, auth, currentPassword, newPassword } = params;
    if (!sessionToken) throw new UnauthorizedException('Missing session');

    const payload = await auth.verifyToken(sessionToken);
    if (!payload.sub || payload.sub === 0) {
      throw new ForbiddenException('Not allowed');
    }

    if (!currentPassword || !newPassword) {
      throw new BadRequestException('Missing password fields');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { passwordHash: true, status: true },
    });
    if (!user) throw new UnauthorizedException('Invalid session');
    if (user.status === UserStatus.INACTIVE) throw new UnauthorizedException('Account is inactive');

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash },
      select: { id: true },
    });

    return { ok: true };
  }
}
