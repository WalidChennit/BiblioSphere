import { IsInt, IsString, IsIn } from 'class-validator';

export class CreateExemplaireDto {
  @IsString()
  code: string;

  @IsIn(['disponible', 'emprunte', 'reserve', 'en_reparation'])
  etat: string;

  @IsInt()
  livreId: number;
}
