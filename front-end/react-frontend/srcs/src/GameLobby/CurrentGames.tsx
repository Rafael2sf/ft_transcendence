import { Alert, Box, ListItem, ListItemButton, ListItemText, Snackbar } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IGameResults } from '../Entities/GameTemplates';
import axios from 'axios';
import { url } from '../Constants/ApiPort';
import WindowDims from '../Entities/WindowDims';

export default function CurrentGames({openedGame, windowSize}:
{
	windowSize:WindowDims,
	openedGame: IGameResults
}) {
	const navigate = useNavigate();
	const [games, setGames] = useState<IGameResults[]>([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [openSnack, setOpenSnack] = useState(false);
  
	function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string) {
		if (reason === 'clickaway') return;
		setOpenSnack(false);
		setTimeout(() => setErrorMessage(""), 150);
	};

	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;

			axios.get(`${url}/games_sessions`, {
				signal: signal,
			})
			.then(response => {
				setGames(response.data);
			})
			.catch ((error) => {
				if (error.response) {
					// The request was made and the server responded with a status code
					// that falls out of the range of 2xx
					if (error.response.status === 401)
					{
						navigate("/login");
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
			});
			
			return () => {
				setTimeout(() => controller.abort(), 5000);
			}
		}, [openedGame]);

	const gameList = games.map((game) => (
		<ListItem key={game.id} disablePadding sx={{backgroundColor: "#356688", border: 1}}>
			<ListItemButton
				onClick={() => navigate(`/lobby/${game.id}`)}
				selected={game.id === openedGame.id}
			>
				<ListItemText 
				  primary={`${game.games_users[0].user.name} game`}
				/>
			</ListItemButton>
		</ListItem>
	))

	return (
		<Box width={ windowSize.width > 1080 ? "300px" : "100%"} flexGrow={1} sx={{overflowY: "auto"}}>
			{gameList}
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
