import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';

import {
  CreateReportDto,
  ReportQueryDto,
  UpdateReportStatusDto,
} from './dto/report.dto';
import { ReportsService } from './reports.service';

import type { Request } from 'express';

import { UserRole } from '@/db/generated/prisma/client';
import { Roles } from '@/modules/users/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/users/auth/guards/roles.guard';



@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: Request, @Body() data: CreateReportDto) {
    const user = req.user as { userId: string };
    return this.reportsService.create(user.userId, data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, data);
  }
}
