import { DefaultValuePipe } from '@nestjs/common';
import { ParseCustomSortPipe } from './parse-custom-sort.pipe';

export const SortAchievementsPipe = [
  new DefaultValuePipe('id'),
  new ParseCustomSortPipe(['id', 'kind', 'title']),
];

export const SortAchievementsUsersPipe = [
  new DefaultValuePipe('id'),
  new ParseCustomSortPipe([
    'id',
    'user_id',
    'achievement_id',
    'created_at',
    'updated_at',
  ]),
];
