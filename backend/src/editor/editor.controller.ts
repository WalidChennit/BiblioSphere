import { Controller, Post, Body, Get, Delete, Param, Req, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { EditorService } from './editor.service';
import { CreateEditorDto } from './dto/create-editor.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';

@ApiTags('Editors')
@Controller('editors')
export class EditorController {
  constructor(
    private readonly editorService: EditorService,
    private readonly auth: AuthService,
  ) {}

  private async requireAdmin(req: Request) {
    const token = req.cookies?.session;
    if (!token) throw new UnauthorizedException('Missing session');
    const payload = await this.auth.verifyToken(token);
    if (payload.role !== 'admin') throw new ForbiddenException('Admin only');
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un éditeur (si inexistant)' })
  create(@Body() dto: CreateEditorDto) {
    return this.editorService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les éditeurs' })
  findAll() {
    return this.editorService.findAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un éditeur sans livres associés' })
  async remove(@Param('id') id: string, @Req() req: Request) {
    await this.requireAdmin(req);
    return this.editorService.remove(Number(id));
  }
}
