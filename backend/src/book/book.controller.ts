import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Livres')
@Controller('livres')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un livre complet' })
  create(@Body() dto: CreateBookDto) {
    return this.bookService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les livres' })
  findAll() {
    return this.bookService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un livre' })
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(Number(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un livre' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) {
    return this.bookService.update(Number(id), dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un livre sans exemplaires' })
  remove(@Param('id') id: string) {
    return this.bookService.remove(Number(id));
  }
}
