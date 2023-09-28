import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';

export class FilterAchievementUserDto {
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
  achievement_id?: number;
}

export class SortDto {
  field: string;
  order: 'asc' | 'desc';
}

export class AchievementUserGetManyDto {
  filter: FilterAchievementUserDto;
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export class CreateAchievementUserDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  user_id: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsPositive()
  achievement_id: number;
}

export class UpdateAchievementUserDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  user_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  achievement_id?: number;
}
