import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationController {
  constructor(private readonly service: ReservationService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une réservation (immédiate si stock dispo, sinon en attente)' })
  create(@Body() dto: CreateReservationDto) {
    return this.service.createWithQueue(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les réservations' })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id/queue-position')
  @ApiOperation({ summary: 'Récupérer la position dans la file (0 si disponible)' })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  queuePosition(@Param('id', ParseIntPipe) id: number) {
    return this.service.getQueuePosition(id);
  }

  @Get('livre/:livreId/queue')
  @ApiOperation({ summary: "Lister la file d'attente (en_attente) d'un livre" })
  @ApiParam({ name: 'livreId', description: 'ID du livre' })
  queueForLivre(@Param('livreId', ParseIntPipe) livreId: number) {
    return this.service.getQueueForLivre(livreId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Annuler une réservation (libère le stock si nécessaire)' })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.service.cancel(id);
  }

  @Patch(':id/pickup')
  @ApiOperation({ summary: "Transformer une réservation en emprunt si la date de réservation est arrivée" })
  @ApiParam({ name: 'id', description: 'ID de la réservation' })
  pickup(@Param('id', ParseIntPipe) id: number) {
    return this.service.pickup(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Lister les réservations d'un utilisateur" })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.listByUser(userId);
  }
}
