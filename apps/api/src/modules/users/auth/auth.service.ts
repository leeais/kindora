import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


import { UsersService } from '../users.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyResetCodeDto,
} from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto as UpdatePasswordDtoOriginal } from './dto/update-password.dto';

import type { Request } from 'express';

import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async register(dto: RegisterDto, _userAgent?: string, _ipAddress?: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existingUser) {
      throw new ConflictException('Email hoặc Username đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const { confirmPassword: _confirmPassword, ...registerData } = dto;

    const user = await this.usersService.create({
      ...registerData,
      password: hashedPassword,
    });

    await this.generateVerificationCode(user.id, user.email, 'SIGNUP');

    const { password: _password, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    };
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Email chưa được xác thực. Vui lòng xác thực email để đăng nhập.',
      );
    }

    return this.createSession(user.id, userAgent, ipAddress);
  }

  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshToken: '', // Sẽ cập nhật sau khi có RT
        userAgent,
        ipAddress,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
      },
    });

    const tokens = await this.getTokens(userId, session.id);
    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    const [user] = await Promise.all([
      this.usersService.findOne(userId),
      this.prisma.session.update({
        where: { id: session.id },
        data: { refreshToken: hashedRefreshToken },
      }),
    ]);

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const { password: _password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async refreshTokens(userId: string, refreshToken: string, sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.refreshToken) {
      throw new UnauthorizedException('Phiên làm việc không hợp lệ');
    }

    const isRtValid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!isRtValid) {
      throw new UnauthorizedException(
        'Phiên làm việc đã hết hạn hoặc không hợp lệ',
      );
    }

    const tokens = await this.getTokens(userId, sessionId);
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);

    const [user] = await Promise.all([
      this.usersService.findOne(userId),
      this.prisma.session.update({
        where: { id: sessionId },
        data: { refreshToken: hashedRt },
      }),
    ]);

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const { password: _password, ...userWithoutPassword } = user;

    return {
      ...tokens,
      user: userWithoutPassword,
    };
  }

  async logout(sessionId: string) {
    try {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
    } catch {
      throw new NotFoundException('Không tìm thấy phiên làm việc');
    }
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.emailVerifiedAt) {
      throw new ConflictException('Email đã được xác thực trước đó');
    }

    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code,
        type: 'SIGNUP',
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException(
        'Mã xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      }),
      this.prisma.verificationCode.deleteMany({
        where: { userId: user.id, type: 'SIGNUP' },
      }),
    ]);

    return { message: 'Xác thực email thành công' };
  }

  async resendVerificationCode(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    if (user.emailVerifiedAt) {
      throw new ConflictException('Email đã được xác thực trước đó');
    }

    await this.generateVerificationCode(user.id, user.email, 'SIGNUP');

    return { message: 'Mã xác thực mới đã được gửi' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'Nếu email tồn tại, mã xác thực sẽ được gửi' };
    }

    await this.generateVerificationCode(user.id, user.email, 'PASSWORD_RESET');

    return { message: 'Mã xác thực để đặt lại mật khẩu đã được gửi' };
  }

  async verifyResetCode(dto: VerifyResetCodeDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const verificationCode = await this.prisma.verificationCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        type: 'PASSWORD_RESET',
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationCode) {
      throw new UnauthorizedException(
        'Mã xác thực không hợp lệ hoặc đã hết hạn',
      );
    }

    // Tạo resetToken ngắn hạn (10 phút)
    const resetToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, type: 'RESET_PASSWORD' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '10m',
      },
    );

    return { resetToken };
  }

  async updatePassword(userId: string, dto: UpdatePasswordDtoOriginal) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Người dùng không hợp lệ');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      this.prisma.session.deleteMany({
        where: { userId },
      }),
    ]);

    return { message: 'Cập nhật mật khẩu thành công' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    try {
      const payload = await this.jwtService.verifyAsync(dto.resetToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      if (payload.type !== 'RESET_PASSWORD') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const userId = payload.sub;
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: userId },
          data: {
            password: hashedPassword,
            emailVerifiedAt: new Date(), // Reset password coi như đã verify email
          },
        }),
        this.prisma.verificationCode.deleteMany({
          where: { userId, type: 'PASSWORD_RESET' },
        }),
        this.prisma.session.deleteMany({
          where: { userId },
        }),
      ]);

      return { message: 'Đặt lại mật khẩu thành công' };
    } catch {
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }
  }

  public async generateVerificationCode(
    userId: string,
    email: string,
    type: string,
  ) {
    // Xóa mã cũ nếu có
    await this.prisma.verificationCode.deleteMany({
      where: { userId, type },
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 phút

    await this.prisma.verificationCode.create({
      data: {
        code,
        userId,
        type,
        expiresAt,
      },
    });

    // TODO: Gửi email ở đây

    console.log(`[Verification Code for ${email}]: ${code}`);

    return code;
  }

  async googleLogin(req: Request) {
    const userPayload = req.user as {
      email: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      providerId?: string;
    }; // Explicitly type req.user
    if (!userPayload || !userPayload.email) {
      throw new UnauthorizedException('Thông tin từ Google không hợp lệ');
    }

    const { email, firstName, lastName, avatar, providerId } = userPayload;

    let user = await this.usersService.findByEmail(email);

    if (!user) {
      user = await this.usersService.create({
        email,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        firstName: firstName || '',
        lastName: lastName || '',
        avatar: avatar || '',
        emailVerifiedAt: new Date(),
      } as Parameters<typeof this.usersService.create>[0]);

      if (providerId) {
        await this.prisma.socialAccount.create({
          data: {
            provider: 'GOOGLE',
            providerId,
            userId: user.id,
          },
        });
      }
    } else {
      if (!user.emailVerifiedAt) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { emailVerifiedAt: new Date() },
          include: { socialAccounts: true },
        });
      }

      const socialAccounts = user.socialAccounts;
      const hasGoogle = socialAccounts?.some((sa) => sa.provider === 'GOOGLE');
      if (!hasGoogle && providerId) {
        await this.prisma.socialAccount.create({
          data: {
            provider: 'GOOGLE',
            providerId,
            userId: user.id,
          },
        });
      }
    }

    if (!user)
      throw new UnauthorizedException('Không thể đăng nhập bằng Google');

    const userAgent = req.get('user-agent') || ''; // Access directly from req
    const ipAddress = req.ip || ''; // Access directly from req

    return this.createSession(user.id, userAgent, ipAddress);
  }

  private async getTokens(userId: string, sessionId: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, sessionId },
        {
          secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_SECRET_EXPIRES_IN'),
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, sessionId },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_SECRET_EXPIRES_IN'),
        },
      ),
    ]);

    const decoded = this.jwtService.decode(at) as { exp: number };
    const expiresAt = decoded.exp * 1000; // Chuyển sang milliseconds

    return {
      accessToken: at,
      refreshToken: rt,
      expiresAt,
    };
  }
}
