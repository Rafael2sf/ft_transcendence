import { Pong } from '../pong';
import { BaseState } from './base.state';
import { ConnectingState } from './connecting.state';

export class WaitingState implements BaseState {
  private count = 60;
  private timer = 0;
  private countdownTime = 0.75;

  private connectionNumber = -1;

  update(dt: number, pong: Pong): void {
    const { stateMachine, paddle1, paddle2 } = pong;

    if (paddle1.active && paddle2.active) {
      this.connectionNumber = 2;
    } else if (paddle1.active || paddle2.active) {
      this.connectionNumber = 1;
    } else if (this.connectionNumber !== -1) {
      this.connectionNumber = 0;
    }

    switch (this.connectionNumber) {
      case 0:
        stateMachine.state = 'FINISHED';
        return;
      case 2:
        stateMachine.state = 'START';
        return;
    }

    this.timer = this.timer + dt;

    if (this.timer > this.countdownTime) {
      this.timer = this.timer % this.countdownTime;
      this.count--;

      if (!this.count) {
        pong.winner = 0;
        stateMachine.state = 'FINISHED';
      }
    }
  }

  exit?(pong: Pong): void {
    const { stateMachine } = pong;
    stateMachine.states['WAITING'] = new ConnectingState();
    const { ball } = pong;
    ball.reset(pong.opts);
  }
}
