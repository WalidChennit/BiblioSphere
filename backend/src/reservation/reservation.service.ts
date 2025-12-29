import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  private buildInitialBorrowDueDate(now: Date) {
    return new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
  }

  private async computeQueuePosition(livreId: number, reservationId: number) {
    // Queue = réservations en attente triées par date
    const pending = await this.prisma.reservation.findMany({
      where: { livreId, statut: 'en_attente' },
      orderBy: { dateReservation: 'asc' },
      select: { id: true },
    });
    const idx = pending.findIndex((r) => r.id === reservationId);
    return idx === -1 ? null : idx + 1;
  }

  async create(dto: CreateReservationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');

    const livre = await this.prisma.livre.findUnique({ where: { id: dto.livreId } });
    if (!livre) throw new NotFoundException('Livre introuvable');

    const reservationDate = dto.dateReservation ? new Date(dto.dateReservation) : new Date();
    if (Number.isNaN(reservationDate.getTime())) throw new BadRequestException('dateReservation invalide');

    const reservationDue = dto.dateReservationDue ? new Date(dto.dateReservationDue) : null;
    if (reservationDue && Number.isNaN(reservationDue.getTime())) throw new BadRequestException('dateReservationDue invalide');
    if (reservationDue && reservationDue.getTime() <= reservationDate.getTime()) {
      throw new BadRequestException('dateReservationDue doit être après dateReservation');
    }

    return this.prisma.$transaction(async (tx) => {
      if (livre.stockDisponible > 0) {
        // Réservation prête (stock dispo) mais reste une réservation jusqu'au pickup
        const res = await tx.reservation.create({
          data: {
            userId: dto.userId,
            livreId: dto.livreId,
            statut: 'disponible',
            dateReservation: reservationDate,
            dateReservationDue: reservationDue,
          } as any,
        });
        await tx.livre.update({
          where: { id: dto.livreId },
          // Hold the copy for this reservation.
          data: { stockDisponible: { decrement: 1 }, reservedCount: { increment: 1 } },
        });
        return { ...res, queuePosition: 0 };
      }

      // pas de stock dispo -> en attente
      const res = await tx.reservation.create({
        data: {
          userId: dto.userId,
          livreId: dto.livreId,
          statut: 'en_attente',
          dateReservation: reservationDate,
          dateReservationDue: reservationDue,
        } as any,
      });
      // queue position calculated outside tx for simplicity
      return res;
    });
  }

  async createWithQueue(dto: CreateReservationDto) {
    const created = await this.create(dto);
    // If reservation is already available => queuePosition 0
    // If pending => compute actual position
    // @ts-expect-error runtime union from create
    if (created?.queuePosition === 0) return created;
    const queuePosition = await this.computeQueuePosition(dto.livreId, (created as any).id);
    return { ...(created as any), queuePosition };
  }

  async getQueuePosition(reservationId: number) {
    const res = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!res) throw new NotFoundException('Réservation introuvable');
    if (res.statut !== 'en_attente') return { reservationId, queuePosition: 0 };
    const queuePosition = await this.computeQueuePosition(res.livreId, reservationId);
    return { reservationId, queuePosition };
  }

  async getQueueForLivre(livreId: number) {
    const livre = await this.prisma.livre.findUnique({ where: { id: livreId } });
    if (!livre) throw new NotFoundException('Livre introuvable');
    const pending = await this.prisma.reservation.findMany({
      where: { livreId, statut: 'en_attente' },
      orderBy: { dateReservation: 'asc' },
      select: { id: true, userId: true, dateReservation: true },
    });
    return {
      livreId,
      pendingCount: pending.length,
      queue: pending.map((r, i) => ({ ...r, position: i + 1 })),
    };
  }

  async cancel(reservationId: number) {
    const res = await this.prisma.reservation.findUnique({ where: { id: reservationId } });
    if (!res) throw new NotFoundException('Réservation introuvable');

    return this.prisma.$transaction(async (tx) => {
      await tx.reservation.delete({ where: { id: reservationId } });
      if (res.statut === 'disponible') {
        await tx.livre.update({
          where: { id: res.livreId },
          data: { stockDisponible: { increment: 1 }, reservedCount: { decrement: 1 } },
        });
      }
      return { ok: true };
    });
  }

  async pickup(reservationId: number) {
    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // Read inside the transaction to avoid races (multiple pickups at once)
      const res = await tx.reservation.findUnique({ where: { id: reservationId } });
      if (!res) {
        // Already picked up / deleted by another request -> treat as idempotent success.
        return { ok: true, alreadyPickedUp: true };
      }

      if (res.dateReservation.getTime() > now.getTime()) {
        throw new BadRequestException("La date de réservation n'est pas encore arrivée");
      }

      if ((res as any).dateReservationDue && (res as any).dateReservationDue.getTime() < now.getTime()) {
        throw new BadRequestException('Réservation expirée');
      }

      const livre = await tx.livre.findUnique({ where: { id: res.livreId } });
      if (!livre) throw new NotFoundException('Livre introuvable');

      const due = this.buildInitialBorrowDueDate(now);
      const emprunt = await tx.emprunt.create({
        data: {
          userId: res.userId,
          livreId: res.livreId,
          dateEmprunt: now,
          dateRetour: due,
          renouvellement: 0,
        },
      });

      // Delete reservation; if another concurrent request deleted it, we treat pickup as idempotent.
      await tx.reservation.deleteMany({ where: { id: reservationId } });

      await tx.livre.update({
        where: { id: res.livreId },
        data: { reservedCount: { decrement: 1 }, borrowedCount: { increment: 1 } },
      });

      return { emprunt, ok: true };
    });
  }

  async listByUser(userId: number) {
    return this.prisma.reservation.findMany({ where: { userId }, include: { livre: true } });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: { livre: true },
      orderBy: { dateReservation: 'desc' },
    });
  }
}
