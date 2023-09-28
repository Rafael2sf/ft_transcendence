import { UserState } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { UserDto } from './user.dto';
import { Transform, Type } from 'class-transformer';
import { UserFilterCtx } from '../enums';

export class UserIdParam implements Pick<UserDto, 'id'> {
  @Type(() => Number)
  @Min(1)
  id: number;
}

export class UserIntranameParam implements Pick<UserDto, 'intraname'> {
  @IsNotEmpty()
  // @Matches(INTRANAME_REGEX)
  intraname: string;
}

export class UserQuery
  implements Partial<Pick<UserDto, 'intraname' | 'name' | 'status' | 'ladder'>>
{
  @IsOptional()
  // @Matches(INTRANAME_REGEX)
  intraname?: string;

  @IsOptional()
  // @Matches(INTRANAME_REGEX)
  name?: string;

  @IsOptional()
  @Transform(({ value }) => value.toUpperCase())
  @IsEnum(UserState)
  status?: UserState;

  @IsOptional()
  @Type(() => Number) // <- if nullish or string - transforms to 0
  @Min(0)
  ladder?: number;
}

/*
  ! Params for filtering all of the users
  * 1. search-bar cotext - filter by LIKE intraname or LIKE name and order lexicographically
  * 2. leaderboard context - list top 10 users, order by ladder desc (limit=10)
 */

// ???: WHAT IS THE FORMAT OF INTRA'S NAME?
export class UsersQuery {
  @IsOptional()
  @IsNotEmpty()
  // @Matches(INTRANAME_REGEX) // name with hypens ???: is that it?
  like?: string;

  // @IsNotEmpty()
  // @IsNumberString()
  @Type(() => Number) // <- most probably it's an atoi
  @Min(1) // minimum 1 rows to display
  limit!: number;
  // * This is essentially a pipeline of validations and transformations made TO THE STRING VALUE
  // ! BUT - they are checked altogether
  // !! BUT BUT BUT - transformers are applied first!

  @Transform(({ value }) => value?.toLowerCase()) // my enums are lowercase
  @IsEnum(UserFilterCtx)
  ctx!: UserFilterCtx;
}
