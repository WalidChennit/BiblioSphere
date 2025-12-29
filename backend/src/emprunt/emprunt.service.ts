import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmpruntDto } from './dto/create-emprunt.dto';

@Injectable()
export class EmpruntService {
  constructor(private prisma: PrismaService) {}

  private validateReturnDateRules(currentDueDate: Date, newDueDate: Date, renouvellement: number) {
    const maxDaysByRenewal = [15, 10, 5];
    const maxDays = maxDaysByRenewal[renouvellement] ?? 0;
    if (maxDays <= 0) throw new BadRequestException('Renouvellement impossible');

    const ms = newDueDate.getTime() - currentDueDate.getTime();
    if (!Number.isFinite(ms)) throw new BadRequestException('dateRetour invalide');
    if (ms <= 0) throw new BadRequestException('dateRetour doit être après la date de retour actuelle');

    const days = ms / (1000 * 60 * 60 * 24);
    if (days > maxDays + 1e-9) {
      throw new BadRequestException(`Extension max dépassée: ${maxDays} jours pour renouvellement ${renouvellement + 1}`);
    }
  }

  async borrow(dto: CreateEmpruntDto) {
    if (!dto.livreId) throw new BadRequestException('livreId requis');
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new BadRequestException('Utilisateur introuvable');
    const livre = await this.prisma.livre.findUnique({ where: { id: dto.livreId } });
    if (!livre) throw new NotFoundException('Livre introuvable');

    // Bloquer si des réservations en attente existent pour ce livre d'autres utilisateurs
    const firstPending = await this.prisma.reservation.findFirst({
      where: { livreId: dto.livreId, statut: 'en_attente' },
      orderBy: { dateReservation: 'asc' },
    });
    if (firstPending) throw new BadRequestException('Réservations en attente pour ce livre');

    if (livre.stockDisponible <= 0) throw new BadRequestException('Aucun exemplaire disponible');

    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      // default initial due date: 15 days after borrow
      const due = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const created = await tx.emprunt.create({
        data: { userId: dto.userId, livreId: dto.livreId!, dateEmprunt: now, dateRetour: due, renouvellement: 0 },
      });
      await tx.livre.update({
        where: { id: dto.livreId! },
        data: { stockDisponible: { decrement: 1 }, borrowedCount: { increment: 1 } },
      });
      return created;
    });
  }

  async returnEmprunt(empruntId: number) {
    const emprunt = await this.prisma.emprunt.findUnique({ where: { id: empruntId } });
    if (!emprunt) throw new NotFoundException('Emprunt introuvable');
    // Some TS servers can cache old Prisma types; use Prisma namespace casts for safety.
    if ((emprunt as unknown as { returnedAt: Date | null }).returnedAt) throw new BadRequestException('Déjà retourné');

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.emprunt.update({
        where: { id: empruntId },
        data: { returnedAt: new Date() } as any,
      });
      const reservation = await tx.reservation.findFirst({
        where: { livreId: emprunt.livreId, statut: 'en_attente' },
        orderBy: { dateReservation: 'asc' },
      });

      if (reservation) {
        await tx.reservation.update({ where: { id: reservation.id }, data: { statut: 'disponible' } });
        await tx.livre.update({
          where: { id: emprunt.livreId },
          data: { reservedCount: { increment: 1 }, borrowedCount: { decrement: 1 } },
        });

        // retourne aussi la position actuelle (0 car maintenant disponible)
        return { ...updated, fulfilledReservationId: reservation.id, queuePosition: 0 };
      } else {
        await tx.livre.update({
          where: { id: emprunt.livreId },
          data: { stockDisponible: { increment: 1 }, borrowedCount: { decrement: 1 } },
        });
      }

      return updated;
    });
  }

  async listByUser(userId: number) {
    const emprunts = await this.prisma.emprunt.findMany({
      where: { userId, returnedAt: null } as any,
      include: { livre: true },
      orderBy: { dateEmprunt: 'desc' },
    });

    const nowMs = Date.now();
    return emprunts.map((e) => {
      const dueMs = e.dateRetour ? new Date(e.dateRetour).getTime() : NaN;
      const isOverdue = !!e.dateRetour && Number.isFinite(dueMs) && dueMs < nowMs;
      return { ...e, isOverdue } as any;
    });
  }

  async findAll() {
    const emprunts = await this.prisma.emprunt.findMany({
      include: { livre: true },
      orderBy: { dateEmprunt: 'desc' },
    });

    const nowMs = Date.now();
    return emprunts.map((e) => {
      const dueMs = e.dateRetour ? new Date(e.dateRetour).getTime() : NaN;
      const isOverdue = !!e.dateRetour && !(e as any).returnedAt && Number.isFinite(dueMs) && dueMs < nowMs;
      return { ...e, isOverdue } as any;
    });
  }

  async renew(empruntId: number, newDateRetour: Date) {
    const emprunt = await this.prisma.emprunt.findUnique({ where: { id: empruntId } });
    if (!emprunt) throw new NotFoundException('Emprunt introuvable');
    if ((emprunt as unknown as { returnedAt: Date | null }).returnedAt) throw new BadRequestException('Emprunt déjà retourné');

    if (emprunt.renouvellement >= 3) throw new BadRequestException('Renouvellement maximum atteint');

    if (!emprunt.dateRetour) throw new BadRequestException('Date de retour actuelle introuvable');
    if (newDateRetour.getTime() <= emprunt.dateRetour.getTime()) {
      throw new BadRequestException('Nouvelle date de retour doit être après la date de retour actuelle');
    }

    // Each renew extends from the CURRENT due date (not from borrow date)
    this.validateReturnDateRules(emprunt.dateRetour, newDateRetour, emprunt.renouvellement);

    return this.prisma.emprunt.update({
      where: { id: empruntId },
      data: {
        dateRetour: newDateRetour,
        renouvellement: { increment: 1 },
      },
    });
  }
}
