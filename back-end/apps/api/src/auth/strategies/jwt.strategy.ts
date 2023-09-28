import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-jwt';
import { UserService } from '../../user-client/user/user.service';
import { User } from '@prisma/client';
import { JwtPayload } from '../../common/interfaces';
import { Request } from 'express';
import { CurrentUserData } from '../../common/interfaces/CurrentUserData.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly userService: UserService) {
    const options: StrategyOptions = {
      jwtFromRequest: JwtStrategy.extractJWTFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    };
    super(options);
  }

  async validate(validationPayload: JwtPayload): Promise<CurrentUserData> {
    const user: User = await this.userService.findByIntraname(
      validationPayload.intraname,
    );
    if (validationPayload.registered === true && !user)
      throw new ForbiddenException('invalid token');
    // if (!user.rt_hash)
    //     throw new ForbiddenException("User's rt_hash is expired or null, login please")
    return { data: user, payload: validationPayload };
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.access_token) {
      return req.cookies.access_token;
    }
    return null;
  }
}
