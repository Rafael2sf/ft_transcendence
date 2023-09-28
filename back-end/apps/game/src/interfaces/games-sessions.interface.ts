import { GameScope, GameTexType } from '@prisma/client';

export class IGameSessionGetMany {
  filter: { scope?: GameScope };
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export class IGameSessionCreate {
  user_id: number;
  scope: GameScope;
  max_score: number;
  tex: string;
  tex_type: GameTexType;
}
