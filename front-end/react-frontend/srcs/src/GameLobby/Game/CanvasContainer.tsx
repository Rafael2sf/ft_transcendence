import { Box, Button, Stack } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import GameSocketContext from '../../Contexts/GameSocket/GameContext';
import ActiveCanvas from './ActiveCanvas';
import { useNavigate } from 'react-router-dom';
import PlayerBanner from './PlayerBanner';
import { IGameResults } from '../../Entities/GameTemplates';
import WindowDims from '../../Entities/WindowDims';


export default function CanvasContainer({player2Switch, gameData, windowSize}: {player2Switch: () => void, gameData: IGameResults, windowSize: WindowDims}) {

	const { GameSocketState, GameSocketDispatch } = useContext(GameSocketContext);
	const navigate = useNavigate();
	const [p1Score, setP1Score] = useState(0);
	const [p2Score, setP2Score] = useState(0);

	useEffect(() => {
		GameSocketDispatch({ type: 'initialize_opened_game', payload: {
			id: gameData.id,
			player_1: null,
			player_2: null,
			ball: null,
			game_state: "WAITING"
		}});
	}, []);
  return (
	<Box flexGrow={1} display="flex" justifyContent="center" alignItems="center" minWidth="400px" overflow="auto">
		{!GameSocketState.openedGame ?
			"Loading..."
			:
			<Stack display="flex" flexDirection="column">
				<Box display="flex" justifyContent="center" alignItems="center" borderRadius={2} border="3px solid black" >
					{gameData.games_users[0] &&
						<PlayerBanner
							bgType={gameData.games_users[0].tex_type}
							bgSrc={gameData.games_users[0].tex}
							score={ p1Score === -1 && gameData.games_users[1] === undefined ? 0 : p1Score}
							player_id={gameData.games_users[0].user.intraname}
							borderRadius="5px 0 0 5px"
							windowSize={windowSize}
						/>
					}
					<Box display="flex" justifyContent="center" alignItems="center" border={windowSize.width > 1500 && windowSize.height > 670 ? 6 :  windowSize.width > 760 && windowSize.height > 370 ? 3 : 2}>
						<ActiveCanvas
							gameData={gameData}
							windowSize={windowSize}
							player2Switch={player2Switch}
							setP1Score={(newVal) => {
								if (p1Score !== newVal)
									setP1Score(newVal);
							}}
							setP2Score={(newVal) => {
								if (p2Score !== newVal)
									setP2Score(newVal);
							}}
						/>
					</Box>
					{gameData.games_users[1] &&
						<PlayerBanner
							bgType={gameData.games_users[1].tex_type}
							bgSrc={gameData.games_users[1].tex}
							score={p2Score}
							player_id={gameData.games_users[1].user.intraname}
							borderRadius="5px 0 0 5px"
							windowSize={windowSize}
						/>
					}
				</Box>
				<Button
				  variant="contained"
				  sx={{ border: 2, backgroundColor: "#001C30" }}
				  onClick={() => navigate("/lobby")}
				>
					Go back to lobby
				</Button>
			</Stack>
		}
	</Box>
  )
}
