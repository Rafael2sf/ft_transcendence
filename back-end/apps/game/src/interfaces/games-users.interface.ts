export class IGamesUsersGetMany {
  filter?: {
    id?: number;
    user_id?: number;
    game_id?: number;
    won?: boolean;
    score?: number;
  };
  limit: number;
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}
