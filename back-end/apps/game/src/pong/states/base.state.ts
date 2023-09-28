import { Pong } from '../pong';

export interface BaseState {
  /**
   * Called every time state machine changes the current state.
   * Changes game object when state starts being the current state.
   *
   * @param pong game object
   */
  enter?(pong: Pong): void;

  /**
   * Updates the game object
   *
   * @param dt delta time
   * @param pong game object
   */
  update(dt: number, pong: Pong): void;

  /**
   * Called every time state machine changes the current state.
   * Changes game object when state stops being the current state.
   *
   * @param pong game object
   */
  exit?(pong: Pong): void;
}
