import { Pong } from '../pong';
import { BaseState } from './base.state';

export class ConnectingState implements BaseState {
  private count = 30;
  private timer = 0;
  private countdownTime = 0.75;

  update(dt: number, pong: Pong): void {
    const { stateMachine, paddle1, paddle2 } = pong;

    this.timer = this.timer + dt;

    if (paddle1.active && paddle2.active) {
      stateMachine.state = 'SERVE';
    }

    if (this.timer > this.countdownTime) {
      this.timer = this.timer % this.countdownTime;
      this.count--;

      if (!this.count) {
        if (paddle1.active) {
          pong.winner = 1;
        } else if (paddle2.active) {
          pong.winner = 2;
        }
        stateMachine.state = 'FINISHED';
      }
    }
  }
}
