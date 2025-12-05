import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ExemplaireService } from './exemplaire.service';
import { CreateExemplaireDto } from './dto/create-exemplaire.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Exemplaires')
@Controller('exemplaires')
export class ExemplaireController {
  constructor(private readonly service: ExemplaireService) {}

  @Post()
  @ApiOperation({ summary: "Créer un exemplaire d'un livre" })
  create(@Body() dto: CreateExemplaireDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les exemplaires' })
  findAll() {
    return this.service.findAll();
  }

  @Get('livre/:id')
  @ApiOperation({ summary: "Lister les exemplaires d'un livre" })
  findByLivre(@Param('id') id: string) {
    return this.service.findByLivre(+id);
  }

  @Patch(':id/etat')
  @ApiOperation({ summary: "Changer l'état d'un exemplaire" })
  updateEtat(
    @Param('id') id: string,
    @Body('etat') etat: string,
  ) {
    return this.service.updateEtat(+id, etat);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un exemplaire' })
  remove(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}
