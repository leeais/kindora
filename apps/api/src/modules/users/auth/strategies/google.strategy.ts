import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') || 'placeholder',
      clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET') || 'placeholder',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ||
        'http://localhost:8081/api/users/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    const user: Express.User = {
      userId: '', // Sẽ được xử lý trong AuthService
      email: emails && emails.length > 0 ? emails[0].value : '',
      firstName: name.givenName,
      lastName: name.familyName,
      avatar: photos && photos.length > 0 ? photos[0].value : undefined,
      providerId: id,
    };
    done(null, user);
  }
}
