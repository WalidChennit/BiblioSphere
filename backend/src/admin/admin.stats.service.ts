import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, months: number) {
  return new Date(d.getFullYear(), d.getMonth() + months, 1);
}

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  async stats(period?: string) {
    const now = new Date();
    const nowMs = now.getTime();

    const normalized = (period || 'last6months').toLowerCase();
    const mode = normalized === 'lastyear' ? 'lastyear' : normalized === 'alltime' ? 'alltime' : 'last6months';

    const [totalUsers, totalBooks, activeLoans] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.livre.count(),
      this.prisma.emprunt.count({ where: { returnedAt: null } as any }),
    ]);

    const overdue = await this.prisma.emprunt.count({
      where: {
        returnedAt: null,
        dateRetour: { not: null, lt: now },
      } as any,
    });

    // Period ranges and charts
    const monthLabel = (key: string) => {
      const [, mm] = key.split('-');
      const short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return short[Math.max(0, Math.min(11, Number(mm) - 1))];
    };

    const bucket = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    const rangeStart = mode === 'lastyear' ? addMonths(startOfMonth(now), -11) : mode === 'last6months' ? addMonths(startOfMonth(now), -5) : null;
    const monthsCount = mode === 'lastyear' ? 12 : mode === 'last6months' ? 6 : 12;

    const months = Array.from({ length: monthsCount }).map((_, i) => {
      const base = rangeStart ?? addMonths(startOfMonth(now), -(monthsCount - 1));
      const d = addMonths(base, i);
      return { key: bucket(d) };
    });

    const usersWhere = rangeStart ? ({ createdAt: { gte: rangeStart } } as any) : ({} as any);
    const booksWhere = rangeStart ? ({ createdAt: { gte: rangeStart } } as any) : ({} as any);

    const [usersCreated, booksCreated] = await Promise.all([
      this.prisma.user.findMany({ where: usersWhere, select: { createdAt: true } }),
      this.prisma.livre.findMany({ where: booksWhere, select: { createdAt: true } }),
    ]);

    const usersByMonth = new Map<string, number>();
    for (const u of usersCreated) usersByMonth.set(bucket(u.createdAt), (usersByMonth.get(bucket(u.createdAt)) ?? 0) + 1);

    const booksByMonth = new Map<string, number>();
    for (const b of booksCreated as any[]) booksByMonth.set(bucket(b.createdAt), (booksByMonth.get(bucket(b.createdAt)) ?? 0) + 1);

    const dashboardData = months.map(({ key }) => ({
      month: monthLabel(key),
      users: usersByMonth.get(key) ?? 0,
      books: booksByMonth.get(key) ?? 0,
    }));

    // KPI deltas
    const pct = (current: number, previous: number) => {
      if (!previous) return current ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const startOfThisMonth = startOfMonth(now);
    const startOfPrevMonth = addMonths(startOfThisMonth, -1);

    const startOfThisYear = new Date(now.getFullYear(), 0, 1);
    const startOfPrevYear = new Date(now.getFullYear() - 1, 0, 1);

    const [usersThis, usersPrev, booksThis, booksPrev] = await Promise.all(
      mode === 'alltime'
        ? [
            this.prisma.user.count(),
            Promise.resolve(0),
            this.prisma.livre.count(),
            Promise.resolve(0),
          ]
        : mode === 'lastyear'
          ? [
              this.prisma.user.count({ where: { createdAt: { gte: startOfThisYear } } as any }),
              this.prisma.user.count({ where: { createdAt: { gte: startOfPrevYear, lt: startOfThisYear } } as any }),
              this.prisma.livre.count({ where: { createdAt: { gte: startOfThisYear } } as any }),
              this.prisma.livre.count({ where: { createdAt: { gte: startOfPrevYear, lt: startOfThisYear } } as any }),
            ]
          : [
              this.prisma.user.count({ where: { createdAt: { gte: startOfThisMonth } } as any }),
              this.prisma.user.count({ where: { createdAt: { gte: startOfPrevMonth, lt: startOfThisMonth } } as any }),
              this.prisma.livre.count({ where: { createdAt: { gte: startOfThisMonth } } as any }),
              this.prisma.livre.count({ where: { createdAt: { gte: startOfPrevMonth, lt: startOfThisMonth } } as any }),
            ]
    );

    const deltaLabel = mode === 'lastyear' ? 'from last year' : mode === 'alltime' ? 'all time' : 'from last month';

    return {
      kpis: {
        totalUsers,
        totalBooks,
        activeLoans,
        overdue,
      },
      kpiDeltas: {
        totalUsersPct: mode === 'alltime' ? null : pct(usersThis, usersPrev),
        totalUsersLabel: deltaLabel,
        totalBooksPct: mode === 'alltime' ? null : pct(booksThis, booksPrev),
        totalBooksLabel: deltaLabel,
      },
      dashboardData,
      period: mode,
      generatedAt: nowMs,
    };
  }
}
