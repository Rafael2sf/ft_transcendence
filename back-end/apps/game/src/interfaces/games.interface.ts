import { GameScope, GameState } from '@prisma/client';

export class IGamesGetMany {
  filter?: {
    id?: number;
    scope?: GameScope;
    state?: GameState;
    max_score?: number;
    started_at?: Date;
    ended_at?: Date;
    user_id?: number;
  };
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}
