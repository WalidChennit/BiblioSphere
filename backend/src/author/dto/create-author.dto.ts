import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({ example: 'Hugo' })
  @IsString()
  nom: string;

  @ApiProperty({ example: 'Victor' })
  @IsString()
  prenom: string;
}
