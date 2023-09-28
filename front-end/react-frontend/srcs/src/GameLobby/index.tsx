import { useEffect, useState, useContext } from 'react';
import WindowDims from '../Entities/WindowDims';
import { Alert, Box, Snackbar, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import CurrentGames from './CurrentGames';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import CanvasContainer from './Game/CanvasContainer';
import { GameScope, IGameResults } from '../Entities/GameTemplates';
import GameSocketContextComponent from '../Contexts/GameSocket/GameSocketContextComponent';
import LobbyChat from './LobbyChat';
import LobbyButtons from './LobbyActions/LobbyButtons';
import LobbyGif from './LobbyGif';
import { UserContext } from '../Contexts/UserContext';

export default function GameLobby({windowSize}: {windowSize:WindowDims}) {

	const location = useLocation();
	const navigate = useNavigate();
	const [gameJoinResponse, setGameJoinResponse] = useState<IGameResults>({
		id: 0,
		scope: GameScope.PUBLIC,
		state: "",
		max_score: 0,
		started_at: "",
		ended_at: "",
		games_users: [],
		created_at: "",
		updated_at: ""
	});
	const [chatOrGames, setChatOrGames] = useState<"games" | "chat">("chat");
	const [loading, setLoading] = useState(true);
	const [player2JoinedSwitch, setPlayer2JoinedSwitch] = useState(false);
	const { userState } = useContext(UserContext);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	useEffect(() => {

		let gameId = location.pathname.slice("/lobby/".length);
		const controller = new AbortController();
		const signal = controller.signal;

		if (gameId.length !== 0) {

			axios.get(`${url}/games_sessions/${gameId}`, {
				signal: signal,
			})
			.then((response) => {
				setGameJoinResponse(response.data);
			})
			.catch((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					if (error.response.status === 401)
					{
						navigate("/login");
						return;
					}
					else
					{
						if (error.response.data.message && typeof(error.response.data.message) !== "string")
							setErrorMessage(error.response.data.message[0]);
						else
							setErrorMessage(error.response.data.message ? error.response.data.message : "ERROR");
						setOpenSnack(true);
					}
				  } else if (error.request) {
					// The request was made but no response was received
					// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
					// http.ClientRequest in node.js
					console.log(error.request);
				  } else {
					// Something happened in setting up the request that triggered an Error
					console.log('Error: ', error.message);
				  }
				navigate(`/lobby`);
			});

		}
		else
		{
			setGameJoinResponse({
				id: 0,
				scope: GameScope.PUBLIC,
				state: "",
				max_score: 0,
				started_at: "",
				ended_at: "",
				games_users: [],
				created_at: "",
				updated_at: ""
			});
		}
		setInterval(() => setLoading(false), 100); //Needed for a smoother experience
		return () => {
			controller.abort();
		}
	}, [location, player2JoinedSwitch]);

	if (loading) return <p>Loading....</p>;

	return (
		<Box display="flex" width="100vw" minWidth="400px" minHeight='calc(100vh - 4rem)' flexDirection="column" marginTop='4rem' sx={{ backgroundImage: 'url(/lobbyBg.jpg)'}}>
			<Box className='lobby' flexGrow={1} display="flex">
				{gameJoinResponse.id ?
					<GameSocketContextComponent gameId={gameJoinResponse.id} userId={userState.id}>
						<CanvasContainer player2Switch={() => setPlayer2JoinedSwitch((oldVal) => !oldVal)} gameData={gameJoinResponse} windowSize={windowSize}></CanvasContainer>
					</GameSocketContextComponent>
					:
					<Box display="flex" flexGrow={1} flexDirection={windowSize.width > 1080 ? "row" : "column"}>
						{ (windowSize.width > 1080 || chatOrGames === "chat") &&
							<LobbyChat windowSize={windowSize}/>
						}
						<Stack flexGrow={1} display="flex" order={windowSize.width > 1080 ? 3 : 1}>
							<Box display="flex" flexGrow={1} alignItems="center" justifyContent="center" minHeight="300px">
								<LobbyGif/>
							</Box>
							<LobbyButtons />
						</Stack>
						{windowSize.width <= 1080 &&
							<Box order={2} width= "100%" display="flex" justifyContent="center" marginBottom={2}>
								<ToggleButtonGroup
								  orientation="horizontal"
								  size="small"
								  exclusive
								  onChange={(e, newVal) => setChatOrGames(newVal)}
								  value={chatOrGames}
								>
									<ToggleButton value={"chat"} sx={{ fontSize: 24}} >Chat</ToggleButton>
									<ToggleButton value={"games"} sx={{ fontSize: 24}} >Games</ToggleButton>
								</ToggleButtonGroup>
							</Box>
						}
						{( windowSize.width > 1080 || chatOrGames === "games") &&
							<Box
							width={windowSize.width > 1080 ? "300px": "100%"}
							order={3}
							sx={{
								overflowX: "clip",
								display: "flex",
								flexDirection: "column",
								maxHeight: windowSize.width > 1080 ? 'calc(100vh - 4rem)' : "300px",
								backgroundColor: "#c4ae7b"
							}}
							>
								<Typography variant='h4' border={3} align='center' bgcolor="#0d283b" width="100%">Active games</Typography>
								<CurrentGames openedGame={gameJoinResponse} windowSize={windowSize}></CurrentGames>
							</Box>
						}
					</Box>
				}
			</Box>
			<Snackbar
				autoHideDuration={2000}
				open={openSnack}
				onClose={handleSnackbarClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
			>
				<Alert onClose={handleSnackbarClose} severity={"error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Box>
	)
}