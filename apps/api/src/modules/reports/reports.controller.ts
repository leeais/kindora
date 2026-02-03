import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import {
  CreateReportDto,
  ReportQueryDto,
  UpdateReportStatusDto,
} from './dto/report.dto';
import { ReportsService } from './reports.service';

import type { Request } from 'express';

import { UserRole } from '@/db/generated/prisma/client';
import { AuditLog } from '@/modules/shared/audit-log/audit-log.decorator';
import { AuditLogInterceptor } from '@/modules/shared/audit-log/audit-log.interceptor';
import { Roles } from '@/modules/users/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { RolesGuard } from '@/modules/users/auth/guards/roles.guard';



@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseInterceptors(AuditLogInterceptor)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @AuditLog('CREATE_REPORT')
  create(@Req() req: Request, @Body() data: CreateReportDto) {
    const user = req.user as { userId: string };
    return this.reportsService.create(user.userId, data);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyReports(@Req() req: Request, @Query() query: ReportQueryDto) {
    const user = req.user as { userId: string };
    return this.reportsService.findMyReports(user.userId, query);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll(@Query() query: ReportQueryDto) {
    return this.reportsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reportsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @AuditLog('RESOLVE_REPORT')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateReportStatusDto,
  ) {
    return this.reportsService.updateStatus(id, data);
  }
}
