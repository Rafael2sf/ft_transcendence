import { Pong } from '../pong';
import { BaseState } from './base.state';

export class StartState implements BaseState {
  update(dt: number, pong: Pong): void {
    const { stateMachine } = pong;
    if (pong.paddle1.active && pong.paddle2.active) {
      stateMachine.state = 'SERVE';
    }
  }

  exit(pong: Pong): void {
    const { paddle1, paddle2 } = pong;
    paddle1.reset();
    paddle2.reset();
    paddle1.serving = true;
    paddle2.serving = false;
  }
}
