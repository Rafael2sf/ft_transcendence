import { GameScope, GameState } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  Max,
} from 'class-validator';

export class FilterGameDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  id?: number;

  @IsOptional()
  @IsEnum(GameScope)
  scope?: GameScope;

  @IsOptional()
  @IsEnum(GameState)
  state?: GameState;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(11)
  max_score?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  started_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ended_at?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  user_id?: number;
}

export class CreateGameDto {
  @IsNotEmpty()
  @IsEnum(GameScope)
  scope: GameScope;

  @IsOptional()
  @IsEnum(GameState)
  state?: GameState;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  @Max(11)
  max_score: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  started_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ended_at?: Date;
}

export class UpdateGameDto {
  @IsOptional()
  @IsEnum(GameScope)
  scope?: GameScope;

  @IsOptional()
  @IsEnum(GameState)
  state?: GameState;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(11)
  max_score?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  started_at?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  ended_at?: Date;
}
