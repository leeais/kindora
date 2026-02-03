import {
  Controller,
  Post,
  Body,
  Req,
  Delete,
  UseGuards,
  Get,
  UnauthorizedException,
  Res,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResendVerificationDto, VerifyEmailDto } from './dto/verify-email.dto';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

import type { Request, Response } from 'express';

import { calcExpiresAt } from '@/common/utils/token.util';
import {
  GoogleAuthGuard,
  JwtAuthGuard,
  JwtRefreshGuard,
} from '@/modules/users/auth/guards/auth.guard';

@Controller('users/auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;
    const result = await this.authService.register(dto, userAgent, ipAddress);
    return result;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.get('user-agent');
    const ipAddress = req.ip;
    const result = await this.authService.login(dto, userAgent, ipAddress);
    return this.handleAuthResponse(res, result);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.email, dto.code);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('verify-reset-code')
  @HttpCode(HttpStatus.OK)
  async verifyResetCode(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update-password')
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    const userId = (req.user as { userId: string }).userId;
    return this.authService.updatePassword(userId, dto);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    if (!user || !user.userId) throw new UnauthorizedException();
    const result = await this.authService.refreshTokens(
      user.userId,
      user.refreshToken || '',
      user.sessionId || '',
    );
    return this.handleAuthResponse(res, result);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    if (!user || !user.sessionId) throw new UnauthorizedException();

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return this.authService.logout(user.sessionId);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() _req: Request) {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const result = await this.authService.googleLogin(req);
    return this.handleGoogleAuthRedirect(res, result);
  }

  private handleAuthResponse(
    res: Response,
    result: {
      refreshToken: string;
      user: { id: string; email: string; [key: string]: unknown };
    },
  ) {
    const { refreshToken, ...response } = result;

    const expiresAt =
      this.configService.get<string>('JWT_REFRESH_SECRET_EXPIRES_IN') || '7d';

    const maxAge = calcExpiresAt(expiresAt);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    return response;
  }

  private handleGoogleAuthRedirect(
    res: Response,
    result: { refreshToken: string; accessToken: string; expiresAt: number },
  ) {
    const { refreshToken, accessToken, expiresAt } = result;

    const expiresAtRefresh =
      this.configService.get<string>('JWT_REFRESH_SECRET_EXPIRES_IN') || '7d';
    const maxAge = calcExpiresAt(expiresAtRefresh);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    const frontendUrlEnv =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const frontendUrl = frontendUrlEnv.split(',')[0].trim();

    return res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&expiresAt=${expiresAt}`,
    );
  }
}
