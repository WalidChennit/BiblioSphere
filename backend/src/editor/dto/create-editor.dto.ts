import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEditorDto {
  @ApiProperty({ example: 'Dunod' })
  @IsString()
  name: string;
}
