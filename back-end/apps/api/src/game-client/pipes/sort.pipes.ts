import { DefaultValuePipe } from '@nestjs/common';
import { ParseCustomSortPipe } from './parse-custom-sort.pipe';

export const SortGamesPipe = [
  new DefaultValuePipe('id'),
  new ParseCustomSortPipe(['id', 'started_at', 'ended_at']),
];

export const SortGamesUsersPipe = [
  new DefaultValuePipe('id'),
  new ParseCustomSortPipe([
    'id',
    'user_id',
    'game_id',
    'score',
    'won',
    'updated_at',
    'created_at',
  ]),
];
