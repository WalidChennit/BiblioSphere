import { Controller, Get, Param, ParseIntPipe, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Lister mes notifications (session cookie)' })
  list(
    @Req() req: Request,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notifications.listForSession({
      sessionToken: req.cookies?.session,
      unreadOnly: unreadOnly === '1' || unreadOnly === 'true',
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Marquer une notification comme lue' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  read(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    return this.notifications.markRead({ sessionToken: req.cookies?.session, notificationId: id });
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Marquer toutes mes notifications comme lues' })
  readAll(@Req() req: Request) {
    return this.notifications.markAllRead({ sessionToken: req.cookies?.session });
  }
}
