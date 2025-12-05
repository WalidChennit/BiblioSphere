import { Controller, Post, Body, Get } from '@nestjs/common';
import { PersonalUserService } from './personal-user.service';
import { CreatePersonalUserDto } from './dto/create-personal-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
@ApiTags('Personal Users')
@Controller('personal-users')
export class PersonalUserController {
  constructor(private service: PersonalUserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a personal user' })
  @ApiResponse({ status: 201, description: 'Created successfully' })
  create(@Body() dto: CreatePersonalUserDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all personal users' })
  findAll() {
    return this.service.findAll();
  }
}
