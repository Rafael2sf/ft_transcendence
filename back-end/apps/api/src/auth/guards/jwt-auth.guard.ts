import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC } from '../decorators';
import { ALLOW_UNREGISTERED } from '../decorators/AllowUneregistered.decorator';
import { BYPASS_2FA } from '../decorators/Bypass2fa.decorator';
import { CurrentUserData } from '../../common/interfaces/CurrentUserData.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private reflector: Reflector = new Reflector()) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const endpoint_is_public: boolean =
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
        context.getHandler(),
        context.getClass(),
      ]);
    const is_unregistered_allowed: boolean =
      this.reflector.getAllAndOverride<boolean>(ALLOW_UNREGISTERED, [
        context.getHandler(),
        context.getClass(),
      ]);
    const bypass2fa: boolean = this.reflector.getAllAndOverride<boolean>(
      BYPASS_2FA,
      [context.getHandler(), context.getClass()],
    );

    if (endpoint_is_public) {
      return true; // bypass the jwt check
    }

    await super.canActivate(context); // <- call auth guard and check claims
    const req = context.switchToHttp().getRequest();
    const { payload }: CurrentUserData = req.user;

    if (payload.registered === false && is_unregistered_allowed != true)
      throw new UnauthorizedException({ path: '/register' });
    if (
      bypass2fa != true &&
      !payload.is_two_factor_authenticated &&
      payload.is_two_factor_enabled
    )
      throw new UnauthorizedException({ path: '/2fa' });
    return true;
  }
}
