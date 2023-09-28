export class IWsUser {
  id: string;
  user_id: number;
  game_id: number;
}

export class IWsKeyEvent {
  id: string;
  user_id: number;
  game_id: number;
  event: 'press' | 'release';
  key: string;
}

export class IWsSpecEvent {
  game_id: number;
  spec_number: number;
}

export class IWsGameUpdate {
  game_id: number;
  dt: number;
}
