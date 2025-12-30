import { Controller, Get, Post, Body, Patch, Param, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import type { Request, Response } from 'express';
import { UserStatus } from '@prisma/client';
import { AuthService } from '../auth/auth.service';

@ApiTags('Users')   // ⭐ Swagger tag
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  create(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs.' })
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activer/Désactiver un utilisateur (admin)' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: UserStatus },
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.updateStatusAsAdmin({
      id: Number(id),
      status: body.status,
      sessionToken: req.cookies?.session,
      res,
      auth: this.auth,
    });
  }

  @Patch('me')
  @ApiOperation({ summary: 'Mettre à jour mon profil (session)' })
  async updateMe(
    @Body() body: { email?: string; telephone?: string; matricule?: string },
    @Req() req: Request,
  ) {
    const token = req.cookies?.session;
    return this.userService.updateMe({ sessionToken: token, auth: this.auth, data: body });
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Changer mon mot de passe (session)' })
  async changeMyPassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req: Request,
  ) {
    const token = req.cookies?.session;
    return this.userService.changeMyPassword({ sessionToken: token, auth: this.auth, ...body });
  }

  @Get('me/notification-prefs')
  @ApiOperation({ summary: 'Récupérer mes préférences de notifications (in-app)' })
  async myNotificationPrefs(@Req() req: Request) {
    const token = req.cookies?.session;
    return this.userService.getMyNotificationPrefs({ sessionToken: token, auth: this.auth });
  }

  @Patch('me/notification-prefs')
  @ApiOperation({ summary: 'Mettre à jour mes préférences de notifications (in-app)' })
  async updateMyNotificationPrefs(
    @Body() body: Record<string, unknown>,
    @Req() req: Request,
  ) {
    const token = req.cookies?.session;
    return this.userService.updateMyNotificationPrefs({ sessionToken: token, auth: this.auth, patch: body });
  }
}
