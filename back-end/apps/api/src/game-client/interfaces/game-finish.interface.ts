export interface IGameFinish {
  ladder?: ILadderEvent;
  game?: IAchievementEvent;
}

export interface ILadderEvent {
  user_id: number;
  new_ladder: number;
}

export interface IAchievementEvent {
  id: number;
  user1: IUserGame;
  user2: IUserGame;
}

export interface IUserGame {
  id: number;
  won: boolean;
  score: number;
}
