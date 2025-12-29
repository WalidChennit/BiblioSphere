import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

@Injectable()
export class StudentStatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: number) {
    const now = new Date();
    const nowMs = now.getTime();

    const [activeBorrowed, allReservations] = await Promise.all([
      this.prisma.emprunt.findMany({
        where: { userId, returnedAt: null } as any,
        select: {
          id: true,
          dateRetour: true,
          livre: { select: { category: { select: { name: true } } } },
        },
      } as any),
      this.prisma.reservation.findMany({ where: { userId } as any, select: { id: true, statut: true } }),
    ]);

    const overdueCount = activeBorrowed.filter((e: any) => e.dateRetour && new Date(e.dateRetour).getTime() < nowMs).length;
    const reservedCount = allReservations.filter((r) => r.statut === 'en_attente').length;
    const availableReservationsCount = allReservations.filter((r) => r.statut === 'disponible').length;

    // Last 6 months trend (borrowed/reserved/returned counts by month)
    const start = addMonths(startOfMonth(now), -5);
    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = addMonths(start, i);
      return { y: d.getFullYear(), m: d.getMonth(), key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` };
    });

    const [borrowedAgg, returnedAgg, reservedAgg] = await Promise.all([
      this.prisma.emprunt.findMany({
        where: { userId, createdAt: { gte: start } } as any,
        select: { createdAt: true },
      }),
      this.prisma.emprunt.findMany({
        where: { userId, returnedAt: { not: null, gte: start } } as any,
        select: { returnedAt: true },
      }),
      this.prisma.reservation.findMany({
        where: { userId, createdAt: { gte: start } } as any,
        select: { createdAt: true },
      }),
    ]);

    const bucket = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const borrowedByMonth = new Map<string, number>();
    for (const e of borrowedAgg) borrowedByMonth.set(bucket(e.createdAt), (borrowedByMonth.get(bucket(e.createdAt)) ?? 0) + 1);

    const returnedByMonth = new Map<string, number>();
    for (const e of returnedAgg as any[]) {
      const dt = e.returnedAt as Date;
      returnedByMonth.set(bucket(dt), (returnedByMonth.get(bucket(dt)) ?? 0) + 1);
    }

    const reservedByMonth = new Map<string, number>();
    for (const r of reservedAgg) reservedByMonth.set(bucket(r.createdAt), (reservedByMonth.get(bucket(r.createdAt)) ?? 0) + 1);

    const monthLabel = (key: string) => {
      const [, mm] = key.split('-');
      const short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return short[Math.max(0, Math.min(11, Number(mm) - 1))];
    };

    const monthlyTrends = months.map(({ key }) => ({
      month: monthLabel(key),
      borrowed: borrowedByMonth.get(key) ?? 0,
      reserved: reservedByMonth.get(key) ?? 0,
      returned: returnedByMonth.get(key) ?? 0,
    }));

    // Categories distribution from current active borrows
    const byCategory = new Map<string, number>();
    for (const e of activeBorrowed as any[]) {
      const name = e?.livre?.category?.name ?? 'Others';
      byCategory.set(name, (byCategory.get(name) ?? 0) + 1);
    }
    const categoryData = Array.from(byCategory.entries()).map(([name, value]) => ({ name, value }));

    return {
      counts: {
        borrowedTotal: borrowedAgg.length, // last 6 months borrowed count
        reservedPending: reservedCount,
        reservedAvailable: availableReservationsCount,
        activeBorrowed: activeBorrowed.length,
        overdue: overdueCount,
      },
      monthlyTrends,
      categoryData,
    };
  }
}
