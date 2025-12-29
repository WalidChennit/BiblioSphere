import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { EmpruntService } from './emprunt.service';
import { CreateEmpruntDto } from './dto/create-emprunt.dto';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

type RenewEmpruntBody = {
  dateRetour: string;
};

@ApiTags('Emprunts')
@Controller('emprunts')
export class EmpruntController {
  constructor(private readonly service: EmpruntService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les emprunts' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Emprunter un livre (décrémente stockDisponible)' })
  borrow(@Body() dto: CreateEmpruntDto) {
    return this.service.borrow(dto);
  }

  @Patch(':id/return')
  @ApiOperation({ summary: 'Retourner un emprunt (gère réservations en attente)' })
  @ApiParam({ name: 'id', description: "ID de l'emprunt" })
  return(@Param('id', ParseIntPipe) id: number) {
    return this.service.returnEmprunt(id);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: "Renouveler un emprunt (max 3) en définissant dateRetour" })
  @ApiParam({ name: 'id', description: "ID de l'emprunt" })
  renew(@Param('id', ParseIntPipe) id: number, @Body() body: RenewEmpruntBody) {
    if (!body?.dateRetour) {
      // service will throw more precise error for invalid date
      return this.service.renew(id, new Date('invalid'));
    }
    return this.service.renew(id, new Date(body.dateRetour));
  }

  @Get('user/:userId')
  @ApiOperation({ summary: "Lister les emprunts actifs d'un utilisateur" })
  @ApiParam({ name: 'userId', description: "ID de l'utilisateur" })
  listByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.service.listByUser(userId);
  }
}
