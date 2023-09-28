import { Pong } from '../pong';
import { BaseState } from './base.state';

export class VictoryState implements BaseState {
  /**
   * Sets the winnning paddle
   *
   * @param pong game object
   */
  enter(pong: Pong): void {
    const { paddle1, paddle2 } = pong;
    // see who is the winner
    if (!paddle1.active && !paddle2.active) {
      pong.winner = 0;
    } else if (pong.winner === 0 && paddle1.id && paddle2.id) {
      pong.winner = paddle1.score > paddle2.score ? 1 : 2;
    } else {
      if (pong.winner === 1) {
        paddle2.score = -1;
      } else {
        paddle1.score = -1;
      }
    }
  }

  update(_dt: number, _pong: Pong): void {
    return;
  }
}
