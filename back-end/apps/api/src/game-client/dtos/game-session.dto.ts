import { GameScope, GameTexType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateGameSessionDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  user_id: number;

  @IsNotEmpty()
  @IsEnum(GameScope)
  scope: GameScope;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  max_score: number;

  @IsNotEmpty()
  @IsString()
  tex: string;

  @IsNotEmpty()
  @IsEnum(GameTexType)
  tex_type: GameTexType;
}

export class JoinGameSessionDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  user_id: number;

  @IsNotEmpty()
  @IsString()
  tex: string;

  @IsNotEmpty()
  @IsEnum(GameTexType)
  tex_type: GameTexType;
}
