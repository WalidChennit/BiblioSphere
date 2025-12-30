import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  private getSessionCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
      path: '/',
    } as const;
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, user } = await this.auth.login(body.email, body.password);

    res.cookie('session', token, {
      ...this.getSessionCookieOptions(),
      // 7 days
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('session', this.getSessionCookieOptions());
    return { ok: true };
  }

  @Get('me')
  async me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.session;
    if (!token) return { user: null };

    const payload = await this.auth.verifyToken(token);

    // If a real DB user is inactive, force logout.
    if (payload.sub && payload.sub !== 0) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { status: true },
      });
      if (dbUser?.status === UserStatus.INACTIVE) {
        res.clearCookie('session', this.getSessionCookieOptions());
        return { user: null };
      }
    }

    return {
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    };
  }
}
