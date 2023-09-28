import { Alert, Box, Grid, Pagination, Snackbar, Typography } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { url } from '../../Constants/ApiPort';
import { UserContext } from '../../Contexts/UserContext';
import { IGameResults } from '../../Entities/GameTemplates';
import { IUser } from '../../Entities/ProfileTemplate';
import WindowDims from '../../Entities/WindowDims';
import { GameHistoryCard } from './GameHistoryCard';
import { useLocation, useNavigate } from 'react-router-dom';

export default function GameHistory({windowSize, profileOwner} : { windowSize: WindowDims, profileOwner: IUser}) {

	const [userGameHistory, setUserGameHistory] = useState<JSX.Element[]>([]);
	const [gamesList, setGamesList] = useState<IGameResults[]>([]);
	const [page, setPage] = useState<number>(1);
	const location = useLocation();
    const navigate = useNavigate();
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
		
		axios.get(`${url}/user/${profileOwner.id}/games?filter[state]=FINISHED`, {
			signal: signal,
		})
		.then((response) => {
			const list: IGameResults[] = response.data;
			setGamesList(list);
			const gamesDivList: JSX.Element[] = list.slice((page - 1) * 10, page * 10).map((game, index) => (
				<GameHistoryCard key={index} gameResults={game} profileOwner={profileOwner}/>
			));
			setUserGameHistory(gamesDivList);
		})
		.catch((error) => {
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
			controller.abort();
		}
	}, [location]);

	useEffect(() => {
		
		if (userGameHistory.length !== 0)
		{
			const newList = gamesList.slice((page - 1) * 10, page * 10).map( (game, index) => (
				<GameHistoryCard key={index} gameResults={game} profileOwner={profileOwner}/>
			))
			setUserGameHistory(newList);
			if (page > 0 && newList.length === 0)
				setPage((oldVal) => oldVal - 1);
		}

	}, [page]);
	
	return (
    	<Box display="flex" flexDirection="column" alignItems="center" height="100%">
			<Typography variant='h5'>GAME HISTORY</Typography>
			<Box display="flex" flexDirection="column" alignItems="center" height="100%" width="100%" >
				<Grid container gap={1} paddingY={1} sx={{width: '100%', maxHeight: windowSize.width >= 900 ? "74vh" : "270px", overflowY: "auto"}}>
					{userGameHistory}
				</Grid>
			</Box>
			<Pagination
			sx={{ m: 1, display: "flex", justifyContent: "center" }}
			count={Math.ceil(gamesList.length / 10)}
			variant='outlined'
			color='primary'
			onChange={(e, value) => setPage(value)}
			/>
			<Snackbar
				autoHideDuration={2000}
				open={openSnack}
				onClose={handleSnackbarClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
			>
				<Alert onClose={handleSnackbarClose} severity={errorMessage.indexOf("Request") === 0 ? "success" : "error"} sx={{ width: '100%' }}>
					{errorMessage}
				</Alert>
			</Snackbar>
		</Box>
	)
}
