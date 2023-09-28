import { AchievementKind } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive, IsString } from 'class-validator';

export class FilterAchievementDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  id?: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(AchievementKind)
  kind?: AchievementKind;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  user_id?: number;
}

export class SortDto {
  field: string;
  order: 'asc' | 'desc';
}

export class AchievementGetManyDto {
  filter: FilterAchievementDto;
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}
