import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { AuditLog } from '@/modules/shared/audit-log/audit-log.decorator';
import { AuditLogInterceptor } from '@/modules/shared/audit-log/audit-log.interceptor';
import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { EmailVerifiedGuard } from '@/modules/users/auth/guards/email-verified.guard';


@ApiTags('Donations')
@ApiBearerAuth()
@Controller('donations')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
@UseInterceptors(AuditLogInterceptor)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @AuditLog('CREATE_DONATION')
  create(
    @CurrentUser() user: Express.User,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    return this.donationsService.create(user.userId, createDonationDto);
  }

  @Post(':id/confirm')
  @AuditLog('CONFIRM_DONATION')
  confirm(@Param('id') id: string) {
    return this.donationsService.confirm(id);
  }

  @Get('impact')
  @AuditLog('VIEW_IMPACT')
  getUserImpact(@CurrentUser() user: Express.User) {
    return this.donationsService.getUserImpact(user.userId);
  }

  @Get('my-donations')
  findAllByUser(
    @CurrentUser() user: Express.User,
    @Query() query: PaginationDto,
  ) {
    return this.donationsService.findAllByUser(user.userId, query);
  }

  @Get('post/:postId')
  findAllByPost(
    @Param('postId') postId: string,
    @Query() query: PaginationDto,
  ) {
    return this.donationsService.findAllByPost(postId, query);
  }
}
