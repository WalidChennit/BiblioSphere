import { Controller, Post, Get, Patch, Delete, Param, Body, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthorService } from './author.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

@ApiTags('Authors')
@Controller('authors')
export class AuthorController {
  constructor(
    private readonly authorService: AuthorService,
    private readonly auth: AuthService,
  ) {}

  private async requireAdmin(req: Request) {
    const token = req.cookies?.session;
    if (!token) throw new UnauthorizedException('Missing session');
    const payload = await this.auth.verifyToken(token);
    if (payload.role !== 'admin') throw new ForbiddenException('Admin only');
  }

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
  async remove(@Param('id') id: string, @Req() req: Request) {
    await this.requireAdmin(req);
    return this.authorService.remove(Number(id));
  }
}
