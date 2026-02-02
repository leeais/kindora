import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { DonationsService } from './donations.service';
import { CreateDonationDto } from './dto/create-donation.dto';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { CurrentUser } from '@/modules/users/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/modules/users/auth/guards/auth.guard';
import { EmailVerifiedGuard } from '@/modules/users/auth/guards/email-verified.guard';


@Controller('donations')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard)
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  create(
    @CurrentUser() user: Express.User,
    @Body() createDonationDto: CreateDonationDto,
  ) {
    return this.donationsService.create(user.userId, createDonationDto);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string) {
    return this.donationsService.confirm(id);
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
