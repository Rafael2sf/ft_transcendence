import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-42';
import { UserService } from '../../user-client/user/user.service';
import { AuthService } from '../auth.service';

@Injectable()
export class Auth42Strategy extends PassportStrategy(Strategy, '42') {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.INTRA_ID_TOKEN,
      clientSecret: process.env.INTRA_SECRET_TOKEN,
      callbackURL: process.env.INTRA_REDIRECTION,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<string | null> {
    // Verify if User exists with the intra profile id.
    // throw NotImplementedException;
    const user = await this.userService.findByIntraname(profile._json.login);
    const is_two_factor_enabled = user
      && (await this.userService.getUser2fa(user.id)).is_two_factor_enabled;
    return !user
      ? this.authService.signJwtToken({
          sub: profile._json.id,
          intraname: profile._json.login,
          registered: false,
          is_two_factor_authenticated: false,
          is_two_factor_enabled: false,
        })
      : this.authService.signJwtToken({
          sub: user.id,
          intraname: user.intraname,
          registered: true,
          is_two_factor_authenticated: false,
          is_two_factor_enabled,
        });
  }
}
