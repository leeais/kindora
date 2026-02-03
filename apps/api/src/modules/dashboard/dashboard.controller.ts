import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';

import { UserRole } from '@/db/generated/prisma/client';
import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { Roles } from '@/modules/users/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/users/auth/guards/roles.guard';


@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('me')
  async getUserStats(@CurrentUser() user: Express.User) {
    return this.dashboardService.getUserStats(user.userId);
  }

  @Get('admin/stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStats() {
    return this.dashboardService.getAdminStats();
  }
}
