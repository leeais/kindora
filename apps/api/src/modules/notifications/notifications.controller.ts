import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationsService } from './notifications.service';

import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';


@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser() user: Express.User,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.findAll(user.userId, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: Express.User) {
    return this.notificationsService.getUnreadCount(user.userId);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: Express.User,
  ) {
    return this.notificationsService.markAsRead(id, user.userId);
  }

  @Post('read-all')
  markAllAsRead(@CurrentUser() user: Express.User) {
    return this.notificationsService.markAllAsRead(user.userId);
  }
}
