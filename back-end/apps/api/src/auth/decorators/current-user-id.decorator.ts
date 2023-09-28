import {
  ExecutionContext,
  createParamDecorator,
  UnauthorizedException,
} from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { User } from '@prisma/client';
import { JwtPayload } from '../../common/interfaces';
import { CurrentUserData } from '../../common/interfaces/CurrentUserData.interface';

export const CurrentUserId = createParamDecorator<any>(function (
  _data: User | JwtPayload | undefined,
  context: ExecutionContext,
): any {
  if (context.getType() !== 'http') {
    throw new UnauthorizedException(
      'non-http requests are not supported on this route',
    );
  }

  const ctx: HttpArgumentsHost = context.switchToHttp();
  const user = (ctx.getRequest().user as CurrentUserData)?.data;
  return user?.id;
});
