import { IPaddle } from '../interfaces/paddle.interface';
import { PongOpts } from './options';

export class Paddle {
  public id: number;

  public score: number;
  public dy: number;

  public width: number;
  public height: number;

  public speed: number;
  public serving: boolean;

  public pressed: { [key: string]: boolean };

  public active: boolean;

  /**
   * Creates a paddle instance.
   * Setting the paddle's id, position, and other properties.
   *
   * @param id id of the paddle
   * @param x x position of the paddle
   * @param y y position of the paddle
   */
  constructor(public x: number, public y: number, opts: PongOpts) {
    this.id = 0;
    this.active = false;

    const { width, height, speed } = opts.paddle;
    this.width = width;
    this.height = height;
    this.speed = speed;

    this.dy = 0;
    this.score = 0;
    this.serving = false;
    this.pressed = {};
  }

  /**
   * Resets the paddle to its default state.
   *
   * @returns void
   */
  reset(): void {
    this.dy = 0;
    this.score = 0;
    this.serving = false;
    this.pressed = {};
  }

  /**
   * Updates the paddles position based on speed and delta time.
   *
   * @param dt delta time
   * @returns void
   */
  update(dt: number, opts: PongOpts): void {
    const { height } = opts;

    if (this.dy < 0) {
      this.y = Math.max(0, this.y + this.dy * dt);
    } else {
      this.y = Math.min(height - this.height, this.y + this.dy * dt);
    }
  }

  /**
   * Returns a paddle object.
   * Used for sending a paddle object to the client.
   *
   * @returns Paddle object
   */
  render(): IPaddle {
    return this as IPaddle;
  }

  /**
   * Activates the paddle.
   * Sets its id.
   *
   * @param id id of the paddle
   * @returns void
   */
  add(id: number): void {
    this.id = id;
    this.active = true;
  }

  /**
   * Inactivates the paddle.
   * Keeps its id.
   *
   * @returns void
   */
  remove(): void {
    this.active = false;
  }
}
