import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CreateReportDto } from './dto/create-report.dto';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

import { UserRole } from '@/db/generated/prisma/client';
import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { Roles } from '@/modules/users/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/users/auth/guards/roles.guard';


@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: Express.User,
    @Body() createReportDto: CreateReportDto,
  ) {
    return this.reportsService.create(user.userId, createReportDto);
  }

  // Admin endpoints
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Patch('admin/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: 'RESOLVED' | 'REJECTED',
  ) {
    return this.reportsService.resolve(id, status);
  }
}
