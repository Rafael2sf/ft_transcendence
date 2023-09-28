import { Pong } from '../pong';
import { BaseState } from './base.state';

export class ServeState implements BaseState {
  private count = 3;
  private timer = 0;
  private countdownTime = 1;

  /**
   * Resets ball position.
   * Sets up a timer for the countdown.
   *
   * @param pong game object
   */
  enter(pong: Pong): void {
    const { ball } = pong;
    ball.reset(pong.opts);

    this.count = 3;
    this.timer = 0;
  }

  /**
   * Updates the game
   * Updates the countdown timer
   * Updates the paddles position
   *
   * @param dt Delta time
   * @param pong Pong object
   */
  update(dt: number, pong: Pong): void {
    const { paddle1, paddle2, stateMachine } = pong;
    const { speed } = pong.opts.paddle;

    if (!paddle1.active || !paddle2.active) {
      stateMachine.state = 'WAITING';
    }

    this.timer = this.timer + dt;

    if (this.timer > this.countdownTime) {
      this.timer = this.timer % this.countdownTime;
      this.count--;

      if (!this.count) {
        stateMachine.state = 'PLAY';
      }
    }

    if (paddle1.pressed['up']) {
      paddle1.dy = -speed;
    } else if (paddle1.pressed['down']) {
      paddle1.dy = speed;
    } else {
      paddle1.dy = 0;
    }

    if (paddle2.pressed['up']) {
      paddle2.dy = -speed;
    } else if (paddle2.pressed['down']) {
      paddle2.dy = speed;
    } else {
      paddle2.dy = 0;
    }

    paddle1.update(dt, pong.opts);
    paddle2.update(dt, pong.opts);
  }
}
