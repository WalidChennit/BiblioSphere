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
import { NotificationService } from '../notification/notification.service';

type NotificationPrefs = {
  // Student
  studentNewBooks?: boolean;
  studentReservationAvailable?: boolean;
  studentBorrowDueSoon?: boolean;

  // Personnel
  personnelReservationAlerts?: boolean;
  personnelBorrowAlerts?: boolean;
  personnelAuthorAdded?: boolean;
};

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    try {
      const created = await this.prisma.user.create({
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

      await this.notifications.create(
        { kind: 'role', role: 'admin' },
        {
          type: 'ADMIN_USER_REGISTERED',
          title: 'New user registered',
          message: `New user registered: ${created.prenom} ${created.nom} (${created.email}).`,
          href: '/admin/users',
          dedupeKey: `ADMIN_USER_REGISTERED:${created.id}`,
        },
      );

      return created;
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
      const isProd = process.env.NODE_ENV === 'production';
      res.clearCookie('session', {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        path: '/',
      });
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

  private sanitizeNotificationPrefsPatch(patch: Record<string, unknown>): Partial<NotificationPrefs> {
    const allowedKeys: Array<keyof NotificationPrefs> = [
      'studentNewBooks',
      'studentReservationAvailable',
      'studentBorrowDueSoon',
      'personnelReservationAlerts',
      'personnelBorrowAlerts',
      'personnelAuthorAdded',
    ];

    const out: Partial<NotificationPrefs> = {};
    for (const key of allowedKeys) {
      if (!(key in patch)) continue;
      const val = (patch as any)[key];
      if (typeof val !== 'boolean') {
        throw new BadRequestException(`Invalid value for ${String(key)} (expected boolean)`);
      }
      (out as any)[key] = val;
    }
    return out;
  }

  private resolveNotificationPrefsForRole(role: string, raw: unknown): NotificationPrefs {
    const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};

    if (role === 'etudiant') {
      return {
        studentNewBooks: (obj.studentNewBooks as boolean | undefined) ?? true,
        studentReservationAvailable: (obj.studentReservationAvailable as boolean | undefined) ?? true,
        studentBorrowDueSoon: (obj.studentBorrowDueSoon as boolean | undefined) ?? true,
      };
    }

    if (role === 'personnel') {
      return {
        personnelReservationAlerts: (obj.personnelReservationAlerts as boolean | undefined) ?? true,
        personnelBorrowAlerts: (obj.personnelBorrowAlerts as boolean | undefined) ?? true,
        personnelAuthorAdded: (obj.personnelAuthorAdded as boolean | undefined) ?? true,
      };
    }

    // Other roles currently have no configurable in-app notification prefs.
    return {};
  }

  async getMyNotificationPrefs(params: { sessionToken?: string; auth: AuthService }) {
    const { sessionToken, auth } = params;
    if (!sessionToken) throw new UnauthorizedException('Missing session');

    const payload = await auth.verifyToken(sessionToken);
    if (!payload.sub || payload.sub === 0) {
      throw new ForbiddenException('Not allowed');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, notificationPrefs: true, status: true },
    });

    if (!user) throw new UnauthorizedException('Invalid session');
    if (user.status === UserStatus.INACTIVE) throw new UnauthorizedException('Account is inactive');

    return {
      ok: true,
      prefs: this.resolveNotificationPrefsForRole(user.role, (user as any).notificationPrefs),
    };
  }

  async updateMyNotificationPrefs(params: {
    sessionToken?: string;
    auth: AuthService;
    patch: Record<string, unknown>;
  }) {
    const { sessionToken, auth, patch } = params;
    if (!sessionToken) throw new UnauthorizedException('Missing session');

    const payload = await auth.verifyToken(sessionToken);
    if (!payload.sub || payload.sub === 0) {
      throw new ForbiddenException('Not allowed');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, notificationPrefs: true, status: true },
    });
    if (!user) throw new UnauthorizedException('Invalid session');
    if (user.status === UserStatus.INACTIVE) throw new UnauthorizedException('Account is inactive');

    const sanitized = this.sanitizeNotificationPrefsPatch(patch);
    const current = ((user as any).notificationPrefs && typeof (user as any).notificationPrefs === 'object'
      ? ((user as any).notificationPrefs as Record<string, unknown>)
      : {}) as Record<string, unknown>;

    const next = { ...current, ...sanitized };

    const updated = await this.prisma.user.update({
      where: { id: payload.sub },
      data: { notificationPrefs: next as any },
      select: { role: true, notificationPrefs: true },
    });

    return {
      ok: true,
      prefs: this.resolveNotificationPrefsForRole(updated.role, (updated as any).notificationPrefs),
    };
  }
}
