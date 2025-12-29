import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateEmpruntDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  livreId: number;
}
