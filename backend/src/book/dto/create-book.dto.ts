import { IsString, IsOptional, IsInt, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  titre: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  isbn: string;

  @ApiProperty()
  @IsOptional()
  @IsInt()
  anneePublication?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  langue?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  categoryId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  editorId: number;

  @ApiProperty({ example: [1, 2] })
  @IsArray()
  authorIds: number[];

  @ApiProperty({ example: 3, required: false, description: 'Nombre d\'exemplaires à créer automatiquement' })
  @IsOptional()
  @IsInt()
  @Min(0)
  nombreExemplaires?: number;
}
