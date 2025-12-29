import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user/user.service';

import { Role } from '@prisma/client';
import { UserStatus } from '@prisma/client';

export type AuthUserPayload = {
  sub: number;
  email: string;
  role: Role;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: { id: number; email: string; role: Role } }> {
    // Hardcoded admin credentials
    if (email === 'BiblioSphere@gmail.com' && password === 'Admin2004') {
      const payload: AuthUserPayload = { sub: 0, email, role: 'admin' };
      const token = await this.jwt.signAsync(payload);
      return { token, user: { id: 0, email, role: 'admin' } };
    }

    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.status === UserStatus.INACTIVE) {
      throw new UnauthorizedException('Account is inactive');
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException('Password not set for this account');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload: AuthUserPayload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwt.signAsync(payload);

    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  async verifyToken(token: string): Promise<AuthUserPayload> {
    try {
      return await this.jwt.verifyAsync<AuthUserPayload>(token, {
        secret: process.env.JWT_SECRET || 'dev-secret-change-me',
      });
    } catch {
      throw new UnauthorizedException('Invalid session');
    }
  }
}
