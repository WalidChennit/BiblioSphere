import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role, UserStatus } from '@prisma/client';

import type { AuthUserPayload } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationCreateInput, NotificationRecipient } from './notification.types';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private async safeCreate(data: Prisma.NotificationCreateInput) {
    try {
      return await this.prisma.notification.create({ data });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        return null;
      }
      throw err;
    }
  }

  async create(recipient: NotificationRecipient, input: NotificationCreateInput) {
    if (recipient.kind === 'user') {
      return this.safeCreate({
        dedupeKey: input.dedupeKey,
        type: input.type,
        title: input.title,
        message: input.message,
        href: input.href ?? null,
        user: { connect: { id: recipient.userId } },
      });
    }

    return this.safeCreate({
      dedupeKey: input.dedupeKey,
      type: input.type,
      title: input.title,
      message: input.message,
      href: input.href ?? null,
      roleTarget: recipient.role,
    });
  }

  async createForAllUsersByRole(role: Role, inputFactory: (userId: number) => NotificationCreateInput) {
    const users = await this.prisma.user.findMany({
      where: { role, status: UserStatus.ACTIVE },
      select: { id: true },
    });

    if (users.length === 0) return { created: 0 };

    const rows = users.map((u) => {
      const input = inputFactory(u.id);
      return {
        dedupeKey: input.dedupeKey,
        type: input.type,
        title: input.title,
        message: input.message,
        href: input.href ?? null,
        userId: u.id,
      };
    });

    const res = await this.prisma.notification.createMany({
      data: rows,
      skipDuplicates: true,
    });

    return { created: res.count };
  }

  private async requireSessionUser(sessionToken?: string) {
    if (!sessionToken) throw new UnauthorizedException('Missing session');
    try {
      return await this.jwt.verifyAsync<AuthUserPayload>(sessionToken, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      });
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }

  private resolvePrefs(raw: unknown): Record<string, boolean> {
    if (!raw || typeof raw !== 'object') return {};
    const obj = raw as Record<string, unknown>;
    const keys = [
      'studentNewBooks',
      'studentReservationAvailable',
      'studentBorrowDueSoon',
      'personnelReservationAlerts',
      'personnelBorrowAlerts',
      'personnelAuthorAdded',
    ] as const;

    const out: Record<string, boolean> = {};
    for (const k of keys) {
      if (typeof obj[k] === 'boolean') out[k] = obj[k] as boolean;
    }
    return out;
  }

  private allowedTypesFor(role: string, prefs: Record<string, boolean>): string[] | null {
    // Default behavior: everything is enabled unless explicitly set to false.
    if (role === 'etudiant') {
      const types: string[] = [];
      if (prefs.studentNewBooks !== false) types.push('STUDENT_BOOK_ADDED');
      if (prefs.studentReservationAvailable !== false) types.push('STUDENT_RESERVATION_TIME_ARRIVED');
      if (prefs.studentBorrowDueSoon !== false) types.push('STUDENT_BORROW_DUE_IN_1_DAY');
      return types;
    }

    if (role === 'personnel') {
      const types: string[] = [];
      if (prefs.personnelReservationAlerts !== false) {
        types.push('PERSONNEL_RESERVATION_CREATED', 'PERSONNEL_RESERVATION_DUE_REACHED');
      }
      if (prefs.personnelBorrowAlerts !== false) {
        types.push('PERSONNEL_BORROW_CREATED', 'PERSONNEL_BORROW_DUE_REACHED');
      }
      if (prefs.personnelAuthorAdded !== false) {
        types.push('PERSONNEL_AUTHOR_ADDED');
      }
      return types;
    }

    // Other roles: no prefs yet
    return null;
  }

  async listForSession(params: { sessionToken?: string; unreadOnly?: boolean; limit?: number }) {
    const payload = await this.requireSessionUser(params.sessionToken);
    const unreadOnly = !!params.unreadOnly;
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);

    if (payload.sub === 0) {
      const where: Prisma.NotificationWhereInput = { roleTarget: 'admin', ...(unreadOnly ? { readAt: null } : {}) };
      const [items, unreadCount] = await this.prisma.$transaction([
        this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
        this.prisma.notification.count({ where: { ...where, readAt: null } }),
      ]);
      return { items, unreadCount };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { status: true, notificationPrefs: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid session');
    }

    const prefs = this.resolvePrefs((user as any).notificationPrefs);
    const allowedTypes = this.allowedTypesFor(payload.role, prefs);

    const where: Prisma.NotificationWhereInput = {
      userId: payload.sub,
      ...(unreadOnly ? { readAt: null } : {}),
      ...(allowedTypes ? { type: { in: allowedTypes } } : {}),
    };

    const [items, unreadCount] = await this.prisma.$transaction([
      this.prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit }),
      this.prisma.notification.count({ where: { ...where, readAt: null } }),
    ]);

    return { items, unreadCount };
  }

  async markRead(params: { sessionToken?: string; notificationId: number }) {
    const payload = await this.requireSessionUser(params.sessionToken);

    const notif = await this.prisma.notification.findUnique({ where: { id: params.notificationId } });
    if (!notif) return { ok: true, notFound: true };

    const isAdmin = payload.sub === 0 && payload.role === 'admin';
    const owns = (!isAdmin && notif.userId === payload.sub) || (isAdmin && notif.roleTarget === 'admin');
    if (!owns) throw new ForbiddenException('Not allowed');

    await this.prisma.notification.update({
      where: { id: params.notificationId },
      data: { readAt: notif.readAt ?? new Date() },
    });

    return { ok: true };
  }

  async markAllRead(params: { sessionToken?: string }) {
    const payload = await this.requireSessionUser(params.sessionToken);

    if (payload.sub === 0 && payload.role === 'admin') {
      await this.prisma.notification.updateMany({
        where: { roleTarget: 'admin', readAt: null },
        data: { readAt: new Date() },
      });
      return { ok: true };
    }

    await this.prisma.notification.updateMany({
      where: { userId: payload.sub, readAt: null },
      data: { readAt: new Date() },
    });

    return { ok: true };
  }
}
