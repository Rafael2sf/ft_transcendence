import { Pong } from './pong';
import { BaseState } from './states/base.state';
import { PlayState } from './states/play.state';
import { ServeState } from './states/serve.state';
import { StartState } from './states/start.state';
import { VictoryState } from './states/victory.state';
import { WaitingState } from './states/waiting.state';

type stateName = 'WAITING' | 'START' | 'SERVE' | 'PLAY' | 'FINISHED';

export class StateMachine {
  public currentState: stateName;
  public states: { [state: string]: BaseState };

  constructor(public pong: Pong) {
    this.states = {
      WAITING: new WaitingState(),
      START: new StartState(),
      SERVE: new ServeState(),
      PLAY: new PlayState(),
      FINISHED: new VictoryState(),
    };
    this.currentState = 'WAITING';
  }

  /**
   * Returns the current state
   *
   * @returns Current state
   */
  get state(): stateName {
    return this.currentState;
  }

  /**
   * Sets the current state
   *
   * @param state State
   * @returns void
   */
  set state(state: stateName) {
    this.states[this.currentState].exit?.(this.pong);
    this.currentState = state;
    this.states[this.currentState].enter?.(this.pong);
  }

  /**
   * Updates the current state
   *
   * @param dt Delta time
   * @returns void
   */
  update(dt: number): void {
    this.states[this.currentState].update(dt, this.pong);
  }
}
