import { AutoMap } from '@automapper/classes';
import type { Prisma } from '@prisma/client';
import {
  BAD_USERNAME_OPTIONS,
  USERNAME_REGEX,
} from '../../common/constants/validation';
import { Matches } from 'class-validator';

export class LoginUserDto implements Prisma.UserWhereUniqueInput {
  @AutoMap()
  intraname: string;
}

export class SignUpUserDto implements Prisma.UserWhereUniqueInput {
  @AutoMap()
  id: number | undefined;

  @AutoMap()
  intraname: string;

  @AutoMap()
  @Matches(USERNAME_REGEX, BAD_USERNAME_OPTIONS)
  name: string;
}
