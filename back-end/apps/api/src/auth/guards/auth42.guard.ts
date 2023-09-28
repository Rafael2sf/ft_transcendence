import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class Auth42Guard extends AuthGuard('42') {
  async canActivate(context: ExecutionContext) {
    (await super.canActivate(context)) as boolean; // goes to 42
    return true;
  }
}
