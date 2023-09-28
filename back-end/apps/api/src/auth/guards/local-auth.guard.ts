import { AuthGuard } from '@nestjs/passport';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { Request } from 'express';
import { LoginUserDto } from '../dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') implements CanActivate {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const intraname = req.body.intraname;

    if (!intraname) {
      throw new UnauthorizedException('User credentials are empty');
    }

    const validateUser: LoginUserDto = {
      intraname,
    };

    const user: User | undefined = await this.authService.validate(
      validateUser,
    );

    if (!user) {
      throw new UnauthorizedException('No such user found in db');
    }

    req['user'] = { data: user, payload: null };
    return true;
  }
}
