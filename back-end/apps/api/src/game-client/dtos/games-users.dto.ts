import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { GameTexType } from '@prisma/client';

export class FilterGameUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  user_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  game_id?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  won?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  score?: number;
}

export class CreateGameUserDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  user_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  game_id: number;

  @IsNotEmpty()
  @IsString()
  tex: string;

  @IsNotEmpty()
  @IsEnum(GameTexType)
  tex_type: GameTexType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  won?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  score?: number;
}

export class UpdateGameUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  user_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  game_id?: number;

  @IsOptional()
  @IsString()
  tex?: string;

  @IsOptional()
  @IsEnum(GameTexType)
  tex_type?: GameTexType;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  won?: boolean;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  score?: number;
}
