import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, IStrategyOptions } from 'passport-local';
import { AuthService } from '../auth.service';
import type { User } from '@prisma/client';
import { LoginUserDto } from '../dto';

export type Optional<T> = T | undefined;

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    const options: IStrategyOptions = {
      usernameField: 'intraname',
      // passwordField: 'password',
    };
    super(options); // pass options to super
  }

  async validate(intraname: string): Promise<User | null> {
    if (!intraname) {
      throw new UnauthorizedException('User credentials are empty');
    }

    const validateUser: LoginUserDto = {
      intraname: intraname,
      // password: password,
    };

    const user: User | undefined = await this.authService.validate(
      validateUser,
    );

    if (!user) {
      throw new UnauthorizedException('No such user found in db');
    }

    return user;
  }
}
