import { IsString, IsEmail, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'walid@gmail.com',
    description: "Adresse email de l'utilisateur (unique)",
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Walid',
    description: "Prénom de l'utilisateur",
  })
  @IsString()
  firstname: string;

  @ApiProperty({
    example: 'Benyamina',
    description: "Nom de famille de l'utilisateur",
  })
  @IsString()
  lastname: string;

  @ApiProperty({
    example: '12345678901234',
    description: 'NIN — Numéro d’Identification National (unique)',
  })
  @IsString()
  nin: string;

  @ApiPropertyOptional({
    example: 'MAT-2025-001',
    description: "Matricule interne (optionnel, dépend du rôle)",
  })
  @IsOptional()
  @IsString()
  matricule?: string;

  @ApiProperty({
    example: '1999-10-12',
    description: 'Date de naissance au format ISO (YYYY-MM-DD)',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    example: '+213554112233',
    description: "Numéro de téléphone de l'utilisateur",
  })
  @IsString()
  phone: string;

  @ApiProperty({
    enum: Role,
    example: Role.etudiant,
    description: "Rôle de l'utilisateur",
  })
  @IsEnum(Role)
  role: Role;

  @ApiProperty({
    example: 'Passer@123',
    description: 'Mot de passe non chiffré (sera hashé avant stockage)',
  })
  @IsString()
  password: string;
}
