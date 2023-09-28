import { IBall } from './ball.interface';
import { IPaddle } from './paddle.interface';

export interface IPong {
  id: number;
  game_state: string;
  ball: IBall;
  player_1: IPaddle;
  player_2: IPaddle;
}
