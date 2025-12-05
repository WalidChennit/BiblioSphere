import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { EditorService } from './editor.service';
import { CreateEditorDto } from './dto/create-editor.dto';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';

@ApiTags('Editors')
@Controller('editors')
export class EditorController {
  constructor(private readonly editorService: EditorService) {}

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
  remove(@Param('id') id: string) {
    return this.editorService.remove(Number(id));
  }
}
