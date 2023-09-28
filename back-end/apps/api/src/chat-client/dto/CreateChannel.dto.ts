import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ChannelType } from '@prisma/client';

export class CreateChannelDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9-]{5,11}$/, {
    message:
      'channel name should have between 6 to 12 characters, it has to start with a character, only lowercase characters, numbers and - are allowed',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ChannelType)
  type: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/, {
    message:
      'password should have between 8 to 32 characters, at least one number, and no special characters',
  })
  password?: string;
}
