import { Controller, Post, Body, Get, Param, Patch, Delete, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

@ApiTags('Livres')
@Controller('livres')
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly auth: AuthService,
  ) {}

  private async requireAdmin(req: Request) {
    const token = req.cookies?.session;
    if (!token) throw new UnauthorizedException('Missing session');
    const payload = await this.auth.verifyToken(token);
    if (payload.role !== 'admin') throw new ForbiddenException('Admin only');
  }

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
  @ApiOperation({ summary: 'Supprimer un livre (aucun emprunt/réservation en cours)' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    await this.requireAdmin(req);
    return this.bookService.remove(Number(id));
  }
}
