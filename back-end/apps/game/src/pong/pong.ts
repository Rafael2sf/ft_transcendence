import { IPong } from './interfaces/pong.interface';
import { PongOpts } from './game-objects/options';
import { StateMachine } from './state-machine';
import { Ball } from './game-objects/ball.object';
import { Paddle } from './game-objects/paddle.object';
import { IFinish } from './interfaces/finished.interface';

export class Pong {
  ball: Ball;
  paddle1: Paddle;
  paddle2: Paddle;
  stateMachine: StateMachine;
  opts: PongOpts;
  winner: 0 | 1 | 2;

  /**
   * Updates game configs with the given options,
   * creates a state machine instance set to WAITING state,
   * and creates a ball instance.
   * @param id id of the game
   * @param opts options of the game
   */
  constructor(readonly id: number, options?: Partial<PongOpts>) {
    this.opts = new PongOpts(options);

    this.winner = 0;

    const { width, height } = this.opts;
    const { width: paddleWidth, height: paddleHeight } = this.opts.paddle;

    this.stateMachine = new StateMachine(this);

    this.ball = new Ball(this.opts);

    this.paddle1 = new Paddle(
      paddleWidth,
      (height - paddleHeight) / 2,
      this.opts,
    );
    this.paddle2 = new Paddle(
      width - paddleWidth * 2,
      (height - paddleHeight) / 2,
      this.opts,
    );
  }

  /**
   * Updates the game
   *
   * @param dt Delta time
   * @returns void
   */
  update(dt: number): void {
    this.stateMachine.update(dt);
  }

  /**
   * Returns the game object
   *
   * @returns Game object
   */
  render(): IPong {
    return {
      id: this.id,
      game_state: this.stateMachine.state,
      ball: this.ball.render(),
      player_1: this.paddle1.render(),
      player_2: this.paddle2.render(),
    };
  }

  /**
   * Adds a player to the game
   *
   * @param id id of a player
   */
  playerAdd(id: number): void {
    if (!this.paddle1.active && id !== this.paddle2.id) {
      this.paddle1.add(id);
    } else if (!this.paddle2.active) {
      this.paddle2.add(id);
    }
  }

  /**
   * Removes a player from the game
   *
   * @param id id of a player
   */
  playerRemove(id: number): void {
    if (id === this.paddle1.id) {
      this.paddle1.remove();
      this.paddle1.pressed = {};
    } else if (id === this.paddle2.id) {
      this.paddle2.remove();
      this.paddle2.pressed = {};
    }
    // } else return;
    // this.stateMachine.state = 'WAITING';
  }

  /**
   * Handles a key up event
   *
   * @param player Player id
   * @param key Key
   */
  keyUp(id: number, key: string): void {
    if (this.paddle1.id === id) {
      this.paddle1.pressed[key] = false;
    } else if (this.paddle2.id === id) {
      this.paddle2.pressed[key] = false;
    }
  }

  /**
   * Handles a key down event
   *
   * @param player Player id
   * @param key Key
   */
  keyDown(id: number, key: string): void {
    if (this.paddle1.id === id) {
      this.paddle1.pressed[key] = true;
    } else if (this.paddle2.id === id) {
      this.paddle2.pressed[key] = true;
    }
  }

  /**
   * Returns a game finished object to dictate how the game history should be
   * handled
   *
   * @returns Finished object
   */
  finish(): IFinish {
    return {
      id: this.id,
      action: !this.winner ? 'delete' : 'update',
      user1: {
        id: this.paddle1.id,
        won: this.winner === 1 ? true : false,
        score: this.paddle1.score,
      },
      user2: {
        id: this.paddle2.id,
        won: this.winner === 2 ? true : false,
        score: this.paddle2.score,
      },
    };
  }
}
