import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

@Injectable()
export class NotificationScheduler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationService,
  ) {}

  private startOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(d: Date) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  }

  // Every 15 minutes: notify students when their reservation time has arrived
  @Cron('0 */15 * * * *')
  async studentReservationTimeArrived() {
    const now = new Date();

    const reservations = await this.prisma.reservation.findMany({
      where: {
        statut: 'disponible',
        dateReservation: { lte: now },
        OR: [{ dateReservationDue: null }, { dateReservationDue: { gt: now } }],
      },
      select: {
        id: true,
        userId: true,
        livre: { select: { id: true, titre: true } },
      },
      orderBy: { dateReservation: 'asc' },
      take: 200,
    });

    for (const r of reservations) {
      await this.notifications.create(
        { kind: 'user', userId: r.userId },
        {
          type: 'STUDENT_RESERVATION_TIME_ARRIVED',
          title: 'Reservation available',
          message: `Your reservation time has arrived for "${r.livre.titre}".`,
          href: '/student/reservations',
          dedupeKey: `STUDENT_RESERVATION_TIME_ARRIVED:${r.id}:${r.userId}`,
        },
      );
    }
  }

  // Hourly: notify personnel when reservation pickup deadline is reached
  @Cron('0 0 * * * *')
  async personnelReservationDueReached() {
    const now = new Date();

    const due = await this.prisma.reservation.findMany({
      where: {
        dateReservationDue: { not: null, lte: now },
        // only relevant while reservation is still in the system
        statut: { in: ['disponible', 'en_attente'] },
      },
      select: {
        id: true,
        user: { select: { prenom: true, nom: true } },
        livre: { select: { titre: true } },
      },
      orderBy: { dateReservationDue: 'asc' },
      take: 200,
    });

    if (due.length === 0) return;

    for (const r of due) {
      await this.notifications.createForAllUsersByRole('personnel', (userId) => ({
        type: 'PERSONNEL_RESERVATION_DUE_REACHED',
        title: 'Reservation due reached',
        message: `Reservation pickup deadline reached for ${r.user.prenom} ${r.user.nom} ("${r.livre.titre}").`,
        href: '/personal/reservations',
        dedupeKey: `PERSONNEL_RESERVATION_DUE_REACHED:${r.id}:${userId}`,
      }));
    }
  }

  // Daily at 08:00: student borrow due in 1 day (tomorrow)
  @Cron('0 0 8 * * *')
  async studentBorrowDueTomorrow() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const start = this.startOfDay(tomorrow);
    const end = this.endOfDay(tomorrow);

    const emprunts = await this.prisma.emprunt.findMany({
      where: {
        returnedAt: null,
        dateRetour: { not: null, gte: start, lte: end },
      },
      select: {
        id: true,
        userId: true,
        livre: { select: { titre: true } },
      },
      orderBy: { dateRetour: 'asc' },
      take: 500,
    });

    for (const e of emprunts) {
      await this.notifications.create(
        { kind: 'user', userId: e.userId },
        {
          type: 'STUDENT_BORROW_DUE_IN_1_DAY',
          title: 'Borrow due soon',
          message: `Your borrow of "${e.livre.titre}" is due tomorrow.`,
          href: '/student/borrowed',
          dedupeKey: `STUDENT_BORROW_DUE_IN_1_DAY:${e.id}:${e.userId}`,
        },
      );
    }
  }

  // Hourly: personnel borrow due date reached (due <= now, not returned)
  @Cron('0 5 * * * *')
  async personnelBorrowDueReached() {
    const now = new Date();

    const emprunts = await this.prisma.emprunt.findMany({
      where: {
        returnedAt: null,
        dateRetour: { not: null, lte: now },
      },
      select: {
        id: true,
        user: { select: { prenom: true, nom: true } },
        livre: { select: { titre: true } },
      },
      orderBy: { dateRetour: 'asc' },
      take: 200,
    });

    if (emprunts.length === 0) return;

    for (const e of emprunts) {
      await this.notifications.createForAllUsersByRole('personnel', (userId) => ({
        type: 'PERSONNEL_BORROW_DUE_REACHED',
        title: 'Borrow due reached',
        message: `Borrow due reached for ${e.user.prenom} ${e.user.nom} ("${e.livre.titre}").`,
        href: '/personal/overdues',
        dedupeKey: `PERSONNEL_BORROW_DUE_REACHED:${e.id}:${userId}`,
      }));
    }
  }
}
