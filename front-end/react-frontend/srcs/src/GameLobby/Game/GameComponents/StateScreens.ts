import { IGameObject, IGameResultUser } from '../../../Entities/GameTemplates';

interface ICanvas {
  context: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  openedGame: IGameObject;
}

export function FinishedState(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  openedGame: IGameObject,
  player2: IGameResultUser | undefined
) {
  context.font = `${canvasHeight / 10}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  let winnerText = '';

  if ((openedGame.player_1?.score as number) === -1 && player2 === undefined)
    winnerText = 'No Match Found';
  else
    winnerText = `Player ${
      (openedGame.player_1?.score as number) >
      (openedGame.player_2?.score as number)
        ? '1'
        : '2'
    }  wins!     `;
  context.fillText(winnerText, canvasWidth / 2, canvasHeight / 3);
}

export function WaitingState(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  context.font = `${canvasHeight / 10}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  const infoText = `Player             Connecting`;
  context.fillText(infoText, canvasWidth / 2, canvasHeight / 3);
}

export function ErrorState(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) {
  context.font = `${canvasHeight / 10}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  const infoText = `Forbidden             Access`;
  context.fillText(infoText, canvasWidth / 2, canvasHeight / 3);
}

export function SpectatorDisplay(
  context: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  specNumber: number
) {
  context.font = `${canvasHeight / 20}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  const infoText = `Watching:                   ${specNumber} users`;
  context.fillText(infoText, canvasWidth / 2, canvasHeight - canvasHeight / 20);
}
