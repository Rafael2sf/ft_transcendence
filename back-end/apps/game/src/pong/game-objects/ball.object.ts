import { IBall } from '../interfaces/ball.interface';
import { PongOpts } from './options';

export class Ball {
  public x: number;
  public y: number;
  public dx: number;
  public dy: number;
  public radius: number;
  public currentSpeed: number;
  public speed: number;

  constructor(opts: PongOpts) {
    const { width, height } = opts;
    const { radius, speed } = opts.ball;

    this.radius = radius;
    this.currentSpeed = speed;
    this.speed = speed;
    this.x = width / 2;
    this.y = height / 2;
    this.dx = 0;
    this.dy = 0;
  }

  /**
   * Starts the ball.
   * Randomizing the direction/speed of the ball.
   *
   * @returns void
   */
  start(servingPlayer: number): void {
    const random = Math.random();
    let angle = random * 90 - 45;
    if (servingPlayer == 1) angle += 180;

    this.currentSpeed = this.speed;
    this.dx = Math.cos(angle * (Math.PI / 180)) * this.currentSpeed;
    this.dy = Math.sin(angle * (Math.PI / 180)) * this.currentSpeed;
  }

  /**
   * Resets the ball.
   * Setting the ball to the center of the screen.
   *
   * @returns void
   */
  reset(opts: PongOpts): void {
    const { width, height } = opts;
    this.x = width / 2;
    this.y = height / 2;
    this.dx = 0;
    this.dy = 0;
  }

  /**
   * Checks if the ball collides with a game object.
   *
   * @param object Game object
   * @returns boolean
   */
  collides(object: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return !(
      this.x + this.radius > object.x ||
      object.x + object.width > this.x - this.radius ||
      this.y + this.radius > object.y + object.height ||
      object.y > this.y + this.radius
    );
  }

  /**
   * Updates the ball position based on speed and delta time.
   *
   * @param dt delta time
   * @returns void
   */
  update(dt: number): void {
    this.x = this.x + this.dx * dt;
    this.y = this.y + this.dy * dt;
  }

  /**
   * Returns the ball object.
   * Used for sending the ball object to the client.
   *
   * @returns Ball object
   */
  render(): IBall {
    return this as IBall;
  }
}
