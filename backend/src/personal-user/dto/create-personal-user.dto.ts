import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePersonalUserDto {
  @ApiProperty({ example: 'Adam', description: 'First name of librarian' })
  @IsString() @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Smith', description: 'Last name of librarian' })
  @IsString() @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'adam@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456789012', description: 'National ID' })
  @IsString() @IsNotEmpty()
  nin: string;

  @ApiProperty({ example: '+213551112233', required: false })
  @IsOptional()
  phone: string;

  @ApiProperty({ example: '1998-04-10', required: false })
  @IsOptional()
  birthDate: string;
}
