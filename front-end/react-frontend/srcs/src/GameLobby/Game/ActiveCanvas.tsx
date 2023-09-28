import { useContext, useEffect, useRef } from 'react'
import GameSocketContext from '../../Contexts/GameSocket/GameContext'
import { Ball } from './GameComponents/Ball';
import { Paddle } from './GameComponents/Paddle';
import {ErrorState, FinishedState, SpectatorDisplay, WaitingState} from './GameComponents/StateScreens';
import { UserContext } from '../../Contexts/UserContext';
import { IGameResults } from '../../Entities/GameTemplates';
import WindowDims from '../../Entities/WindowDims';

export default function ActiveCanvas({gameData, windowSize, player2Switch, setP1Score, setP2Score }: {
	gameData: IGameResults,
	windowSize: WindowDims,
	player2Switch: () => void,
	setP1Score: (newScore:number) => void,
	setP2Score: (newScore:number) => void,
}) {

	const { GameSocketState } = useContext(GameSocketContext);
	const { userState } = useContext(UserContext);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const requestIdRef = useRef<number | null>(null);
	const switchRef = useRef<boolean>(false);

	function renderFrame(img_p1: HTMLImageElement, img_p2: HTMLImageElement) {

		if (GameSocketState.openedGame)
		{
			setP1Score(GameSocketState.openedGame.player_1?.score as number);
			setP2Score(GameSocketState.openedGame.player_2?.score as number);
		}
		if (canvasRef.current !== null) {
			const canvas = canvasRef.current;
			const context = canvas?.getContext('2d');
			if (context == null)
				throw new Error('Could not get context');

			context.clearRect(0,0, canvas.width, canvas.height);
				context.fillStyle = "#131B9A";
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = "white";
			context.fillRect(0, canvas.height / 2 - (3 * canvas.width / 1080), canvas.width, 6 * canvas.width / 1080);
			context.fillStyle = "black";
			context.fillRect(canvas.width / 2 - (4 * canvas.width / 1080), 0, 8 * canvas.width / 1080, canvas.height);
			SpectatorDisplay(context, canvas.width, canvas.height, GameSocketState.specNumber);

      if (GameSocketState.openedGame?.game_state === "ERROR")
      {
        ErrorState(context, canvas.width, canvas.height);
        return;
      }
			if (GameSocketState.openedGame?.game_state === "WAITING")
				WaitingState(context, canvas.width, canvas.height);
			else if (GameSocketState.openedGame?.game_state === "FINISHED")
				FinishedState(context, canvas.width, canvas.height, GameSocketState.openedGame, gameData.games_users[1]);
			else {

				if (switchRef.current === false)
				{
					switchRef.current = true;
					player2Switch();
					return;
				}
				// Handles ball creation
				if (GameSocketState.openedGame?.ball)
					new Ball(GameSocketState.openedGame.ball).draw(context, canvas.width / 1080);

				// Handles player 1 paddle creation
				if (gameData.games_users[0])
				{
					if (GameSocketState.openedGame?.player_1 && gameData.games_users[0].tex_type === "image")
						new Paddle(GameSocketState.openedGame.player_1)?.draw(context, img_p1, canvas.width / 1080);
					else if (GameSocketState.openedGame?.player_1)
						new Paddle(GameSocketState.openedGame.player_1)?.drawRect(context, gameData.games_users[0].tex, canvas.width / 1080);
				}

				// Handles player 2 paddle creation
				if (gameData.games_users[1])
				{
					if (GameSocketState.openedGame?.player_2 && gameData.games_users[1]?.tex_type === "image")
						new Paddle(GameSocketState.openedGame.player_2)?.draw(context, img_p2, canvas.width / 1080);
					else if (GameSocketState.openedGame?.player_2)
						new Paddle(GameSocketState.openedGame.player_2)?.drawRect(context, gameData.games_users[1].tex, canvas.width / 1080);
				}

			}
		}
	}

	useEffect(() => {

		const img_p1 = new Image();
		const img_p2 = new Image();

		if (canvasRef.current)
			canvasRef.current.focus();
		function tick() {
			if (!canvasRef.current)
				return;

			renderFrame(img_p1, img_p2);

			//Animation
			requestIdRef.current = requestAnimationFrame(tick);
		}

		//Hardcoded and ugly, need to work on this later
		if (gameData.games_users[0].tex_type === "image")
		{
			img_p1.onload = () => {
				if (gameData.games_users[1]?.tex_type === "image")
				{
					img_p2.onload = () => {
						requestIdRef.current = requestAnimationFrame(tick);
					}
					img_p2.src = (`/${gameData.games_users[1].tex}_paddle.png`);
				}
				else
					requestIdRef.current = requestAnimationFrame(tick);
			}
			img_p1.src = (`/${gameData.games_users[0].tex}_paddle.png`);
		}
		else if (gameData.games_users[1]?.tex_type === "image")
		{
			img_p2.onload = () => {
				requestIdRef.current = requestAnimationFrame(tick);
			}
			img_p2.src = (`/${gameData.games_users[1].tex}_paddle.png`);
		}
		else
			requestIdRef.current = requestAnimationFrame(tick);

		return () => {
			if (requestIdRef.current)
				cancelAnimationFrame(requestIdRef.current);
		}

	}, [gameData.games_users[1]]);

	return (
		<canvas
			id="canvas"
			height={ windowSize.width > 1500 && windowSize.height > 670 ? "600px" : windowSize.width > 760  && windowSize.height > 370 ? "300px" : "150px"}
			width={ windowSize.width > 1500 && windowSize.height > 670 ? "1080px" : windowSize.width > 760  && windowSize.height > 370 ? "540px" : "270px"}
			ref={canvasRef}
			tabIndex={0}

			onKeyDown={ userState.id === gameData.games_users[0]?.user.id || userState.id === gameData.games_users[1]?.user.id ?
				(e) => {
					if (e.key === 'w')
						GameSocketState.socket?.emit("key.press.up", {
							game_id: GameSocketState.openedGame?.id,
							user_id: userState.id,

						});
					else if (e.key === 's')
						GameSocketState.socket?.emit("key.press.down", {
							game_id: GameSocketState.openedGame?.id,
							user_id: userState.id,
						});
				}
				:
				undefined
			}
			onKeyUp={ userState.id === gameData.games_users[0]?.user.id || userState.id === gameData.games_users[1]?.user.id ?
				(e) => {
					if (e.key === 'w')
						GameSocketState.socket?.emit("key.release.up", {
							game_id: GameSocketState.openedGame?.id,
							user_id: userState.id,
						});
					else if (e.key === 's')
						GameSocketState.socket?.emit("key.release.down", {
							game_id: GameSocketState.openedGame?.id,
							user_id: userState.id,
						});
				}
				:
				undefined
			}
		>

		</canvas>
  	)
}
