import { Controller, Post, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Authors')
@Controller('authors')
export class AuthorController {
  constructor(private readonly authorService: AuthorService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un auteur (nom + prénom)' })
  create(@Body() dto: CreateAuthorDto) {
    return this.authorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les auteurs' })
  findAll() {
    return this.authorService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un auteur par ID' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.authorService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un auteur' })
  update(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.authorService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un auteur sans livre' })
  remove(@Param('id') id: string) {
    return this.authorService.remove(Number(id));
  }
}
