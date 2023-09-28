import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

enum UpdateChannelRole {
  USER,
  ADMIN,
  OWNER,
}

export class UpdateChannelUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(UpdateChannelRole)
  @MaxLength(32)
  permission: string;
}
