import React, { createContext } from 'react';
import { Socket } from 'socket.io-client';
import {
  IGameEvent,
  IGameObject,
  IGameRoom,
} from '../../Entities/GameTemplates';

export interface IGameSocketContextState {
  socket: Socket | undefined;
  openedGame: IGameObject | null;
  activeGames: IGameRoom[];
  specNumber: number;
}

export const defaultGameSocketContextState: IGameSocketContextState = {
  socket: undefined,
  openedGame: null,
  activeGames: [],
  specNumber: 0,
};

export type TGameSocketContextActions =
  | 'update_socket'
  | 'update_game_spectators'
  | 'update_game_render'
  | 'initialize_opened_game'
  | 'error';

export type TGameSocketContextPayload =
  | Socket
  | IGameRoom
  | IGameEvent
  | IGameObject
  | null;

export interface IGameSocketContextActions {
  type: TGameSocketContextActions;
  payload: TGameSocketContextPayload;
}

export const GameSocketReducer = (
  state: IGameSocketContextState,
  action: IGameSocketContextActions
) => {
  switch (action.type) {
    case 'update_socket':
      return { ...state, socket: action.payload as Socket };
    case 'update_game_spectators': {
      if (state.openedGame?.id === (action.payload as IGameEvent).game_id)
        state.specNumber = (action.payload as IGameEvent).spec_number;
      return state;
    }
    case 'update_game_render': {
      if ((action.payload as IGameObject).id === state.openedGame?.id)
        state.openedGame = action.payload as IGameObject;
      return state;
    }
    case 'error': {
      if (state.openedGame) state.openedGame.game_state = 'ERROR';
      return state;
    }
    case 'initialize_opened_game': {
      return {
        ...state,
        openedGame: action.payload as IGameObject,
      };
    }
    default:
      return { ...state };
  }
};

export interface IGameSocketContextProps {
  GameSocketState: IGameSocketContextState;
  GameSocketDispatch: React.Dispatch<IGameSocketContextActions>;
}

const GameSocketContext = createContext<IGameSocketContextProps>({
  GameSocketState: defaultGameSocketContextState,
  GameSocketDispatch: () => {},
});

export const GameSocketContextProvider = GameSocketContext.Provider;

export default GameSocketContext;
