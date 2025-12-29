import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonalStatsService {
  constructor(private prisma: PrismaService) {}

  async stats() {
    const [totalBooks, activeBorrows, overdueItems, pendingReservations] = await Promise.all([
      this.prisma.livre.count(),
      this.prisma.emprunt.count({ where: { returnedAt: null } as any }),
      this.prisma.emprunt.count({
        where: {
          returnedAt: null,
          dateRetour: { not: null, lt: new Date() },
        } as any,
      }),
      this.prisma.reservation.count({ where: { statut: 'en_attente' } as any }),
    ]);

    const overduesRaw = await this.prisma.emprunt.findMany({
      where: {
        returnedAt: null,
        dateRetour: { not: null, lt: new Date() },
      } as any,
      include: { livre: true },
      orderBy: { dateRetour: 'asc' },
      take: 5,
    });

    const readyReservationsRaw = await this.prisma.reservation.findMany({
      where: { statut: 'disponible' } as any,
      include: { livre: true },
      orderBy: { dateReservation: 'asc' },
      take: 5,
    });

    const borrowsRaw = await this.prisma.emprunt.findMany({
      where: { returnedAt: null } as any,
      include: { livre: true },
      orderBy: { dateEmprunt: 'desc' },
      take: 3,
    });

    return {
      kpis: {
        totalBooks,
        activeBorrows,
        overdueItems,
        pendingReservations,
      },
      overdues: overduesRaw.map((e) => ({
        id: e.id,
        userId: e.userId,
        livreId: e.livreId,
        dueDate: e.dateRetour,
        title: e.livre?.titre ?? null,
      })),
      readyReservations: readyReservationsRaw.map((r) => ({
        id: r.id,
        userId: r.userId,
        livreId: r.livreId,
        dateReservation: r.dateReservation,
        statut: r.statut,
        title: r.livre?.titre ?? null,
      })),
      borrows: borrowsRaw.map((e) => ({
        id: e.id,
        userId: e.userId,
        livreId: e.livreId,
        borrowedAt: e.dateEmprunt,
        dueDate: e.dateRetour,
        renouvellement: e.renouvellement,
        title: e.livre?.titre ?? null,
      })),
    };
  }
}
