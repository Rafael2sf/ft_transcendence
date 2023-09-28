import { IUser } from './ProfileTemplate';

export interface IGameUser {
  id: number;
  intraname: string;
  x: number;
  y: number;
  dy: number;
  width: number;
  height: number;
  speed: number;
  score: number;
  // serving: boolean;
}

export interface IBall {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

// Keep all values but the id at null if "CREATED" allows to create a game object on entering the room and olny create positions as soon as we receive the first event of the rro
export interface IGameObject {
  id: number;
  player_1: IGameUser | null;
  player_2: IGameUser | null;
  ball: IBall | null;
  game_state: 'START' | 'SERVE' | 'PLAY' | 'WAITING' | 'FINISHED' | 'ERROR';
}
export interface IGameRoom {
  id: number;
  player_1: string;
  player_2: string;
  spec_number: number;
}

export interface IGameEvent {
  game_id: number;
  spec_number: number;
}

export interface IPaddleOpts {
  paddleTexType: 'color' | 'image';
  paddleTex: string;
}

export interface IGameResultUser {
  id: number;
  user_id: number;
  game_id: number;
  tex: string;
  tex_type: string;
  won: boolean;
  score: number;
  created_at: string;
  updated_at: string;
  user: IUser;
}

export interface IGameResults {
  id: number;
  scope: GameScope;
  state: string;
  max_score: number;
  started_at: string;
  ended_at: string;
  games_users: IGameResultUser[];
  created_at: string;
  updated_at: string;
}

export enum GameScope {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

export interface ILadderUpdate {
  user_id: number;
  new_ladder: number;
}
