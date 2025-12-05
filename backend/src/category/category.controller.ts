import { Controller, Post, Body, Get, Delete, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // ✅ CREATE
  @Post()
  @ApiOperation({ summary: 'Créer une catégorie (si elle n’existe pas)' })
  @ApiResponse({ status: 201, description: 'Catégorie créée avec succès' })
  @ApiResponse({ status: 400, description: 'Catégorie déjà existante' })
  create(@Body() dto: CreateCategoryDto) {
    return this.categoryService.create(dto);
  }

  // ✅ GET ALL
  @Get()
  @ApiOperation({ summary: 'Lister toutes les catégories' })
  findAll() {
    return this.categoryService.findAll();
  }

  // ✅ DELETE SI AUCUN LIVRE ASSOCIÉ
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une catégorie si aucun livre n’est associé' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Catégorie supprimée' })
  @ApiResponse({
    status: 400,
    description: 'Suppression impossible : livres associés',
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(Number(id));
  }
}
