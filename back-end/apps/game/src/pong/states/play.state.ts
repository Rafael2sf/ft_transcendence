import { Pong } from '../pong';
import { BaseState } from './base.state';

export class PlayState implements BaseState {
  /**
   * Starts the ball movement
   *
   * @param pong Pong object
   * @returns void
   */
  enter(pong: Pong): void {
    const { paddle1, ball } = pong;
    if (paddle1.serving) ball.start(1);
    else ball.start(2);
  }

  update(dt: number, pong: Pong): void {
    const { paddle1, paddle2, ball, stateMachine } = pong;
    const { speed } = pong.opts.paddle;
    const { maxScore } = pong.opts;

    if (!paddle1.active || !paddle2.active) {
      stateMachine.state = 'WAITING';
    }

    // checking ball collisions
    if (
      ball.x - ball.radius < paddle1.x + paddle1.width &&
      ball.y + ball.radius > paddle1.y &&
      ball.y - ball.radius < paddle1.y + paddle1.height
    ) {
      ball.currentSpeed += 100;
      const ballAngle =
        ((paddle1.y + paddle1.height / 2 - ball.y) / (paddle1.height / 2)) *
        (Math.PI / 4);
      ball.dx = Math.cos(ballAngle) * ball.currentSpeed;
      ball.dy = -Math.sin(ballAngle) * ball.currentSpeed;
    }
    // detect collision with paddle2
    if (
      ball.x + ball.radius > paddle2.x &&
      ball.y + ball.radius > paddle2.y &&
      ball.y - ball.radius < paddle2.y + paddle2.height
    ) {
      ball.currentSpeed += 10;
      const ballAngle =
        ((paddle2.y + paddle2.height / 2 - ball.y) / (paddle2.height / 2)) *
        (Math.PI / 4);
      ball.dx = -Math.cos(ballAngle) * ball.currentSpeed;
      ball.dy = -Math.sin(ballAngle) * ball.currentSpeed;
    }

    const { height, width } = pong.opts;
    // detect collision with upper screen boundary
    if (ball.y - ball.radius <= 0) {
      ball.y = ball.radius;
      ball.dy = -ball.dy;
    }
    // detect collision with lower screen boundary
    if (ball.y + ball.radius >= height) {
      ball.y = height - ball.radius;
      ball.dy = -ball.dy;
    }

    // detect if ball has gone past paddle2 (paddle1 scored)
    if (ball.x + ball.radius >= width) {
      paddle1.serving = false;
      paddle2.serving = true;
      // update player score
      paddle1.score++;
      // check if player1 won the game
      if (paddle1.score === maxScore) {
        stateMachine.state = 'FINISHED';
      } else {
        stateMachine.state = 'SERVE';
      }
    }

    // detect if ball has gone past paddle1 (paddle2 scored)
    if (ball.x - ball.radius <= 0) {
      paddle1.serving = true;
      paddle2.serving = false;
      // update player score
      paddle2.score++;
      // check if player2 won the game
      if (paddle2.score === maxScore) {
        stateMachine.state = 'FINISHED';
      } else {
        stateMachine.state = 'SERVE';
      }
    }

    // detect player movement
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

    // update ball and paddles
    ball.update(dt);
    paddle1.update(dt, pong.opts);
    paddle2.update(dt, pong.opts);
  }
}
