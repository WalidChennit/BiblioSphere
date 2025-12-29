import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  livreId: number;

  @ApiPropertyOptional({ example: '2025-12-27T10:30:00.000Z', description: 'Reservation date (ISO). Defaults to now.' })
  @IsOptional()
  @IsISO8601()
  dateReservation?: string;

  @ApiPropertyOptional({
    example: '2026-01-03T10:30:00.000Z',
    description: 'Reservation due/expiration date (ISO). Optional.',
  })
  @IsOptional()
  @IsISO8601()
  dateReservationDue?: string;
}
