import { User, UserState } from '@prisma/client';
import { AutoMap } from '@automapper/classes';
import {
  IsAlphanumeric,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
} from 'class-validator';
import {
  USERNAME_REGEX,
  BAD_USERNAME_OPTIONS,
} from 'apps/api/src/common/constants/validation';

export class UserDto implements User {
  @AutoMap()
  id: number;

  @AutoMap()
  intraname: string;

  @AutoMap()
  name: string;

  @AutoMap()
  picture: string;

  @AutoMap()
  status: UserState;

  @AutoMap()
  ladder: number;

  @AutoMap()
  is_two_factor_enabled: boolean;

  @AutoMap()
  @IsOptional()
  two_factor_secret: string;
}

export class CreateUserDto
  implements Partial<Pick<UserDto, 'intraname' | 'id' | 'picture' | 'name'>>
{
  @AutoMap()
  @IsNotEmpty()
  @IsAlphanumeric()
  intraname!: string;

  @AutoMap()
  @IsNotEmpty()
  @IsNumber()
  id?: number;

  @AutoMap()
  @IsOptional()
  picture?: string;

  @AutoMap()
  @IsOptional()
  @IsAlphanumeric()
  name?: string;
}

export class UpdateUserDto
  implements Partial<Pick<UserDto, 'name' | 'picture'>>
{
  @AutoMap()
  @IsOptional()
  @Matches(USERNAME_REGEX, BAD_USERNAME_OPTIONS)
  name?: string;

  @AutoMap()
  @IsOptional()
  picture?: string;

  @AutoMap()
  @IsOptional()
  two_factor_secret: string;
}
