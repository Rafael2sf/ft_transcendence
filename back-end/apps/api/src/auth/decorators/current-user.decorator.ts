import {
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { UserEntity } from '../../user-client/user/entities/user.entity';
import { CurrentUserData } from '../../common/interfaces/CurrentUserData.interface';

export const CurrentUser = createParamDecorator<any>(function (
  _data: string | undefined,
  context: ExecutionContext,
): UserEntity {
  // this creates function that returns user object from the current context
  if (context.getType() !== 'http')
    throw new UnauthorizedException(
      'non-http requests are not supported on this route',
    );

  const ctx: HttpArgumentsHost = context.switchToHttp();
  const user = (ctx.getRequest().user as CurrentUserData)?.data ?? null;
  return user;
});
